import { canvasToBlob, createObjectURL, revokeObjectURL } from 'blob-util';
import { createRef } from 'react';
import * as Webcam from 'react-webcam';
import { combineReducers } from 'redux';
import { combineEpics, StateObservable } from 'redux-observable';
import {
  combineLatest,
  concat,
  empty,
  from,
  fromEvent,
  interval,
  of,
  Observable,
  timer,
} from 'rxjs';
import {
  catchError,
  concatAll,
  combineAll,
  concatMap,
  defaultIfEmpty,
  delay,
  filter,
  ignoreElements,
  map,
  mapTo,
  mergeMap,
  last,
  switchMap,
  delayWhen,
  timeout,
  tap,
} from 'rxjs/operators';
import { ActionType, isOfType } from 'typesafe-actions';
import { FaceOffModel } from './models';
import * as actions from './actions';
import {
  fetchMp4Url,
  fetchedMp4Url,
  loadedModels,
  detectFaces,
  detectedVideoFaces,
  detectedWebcamFaces,
  detectedImageFaces,
  loadedVideo,
  loadedWebcam,
} from './actions';
import {
  SWITCH_TAB,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES,
  SWITCH_FACINGMODE,
  CHANGE_VIDEOURL,
  LOADED_VIDEO,
  LOADED_WEBCAM,
  FETCH_MP4URL,
  FETCHED_MP4URL,
  START_APP,
  STOP_APP,
  LOADED_MODELS,
  DETECT_FACES,
  DETECTED_VIDEOFACES,
  DETECTED_WEBCAMFACES,
  DETECTED_IMAGEFACES,
  FACINGMODE_REAR,
  VIDEO_API,
  DEFAULT_VIDEO_URL,
  MAX_WIDTH,
  MAX_HEIGHT,
} from './constants';

// import {
//   detectAllFaces,
//   loadSsdMobilenetv1Model,
//   SsdMobilenetv1Options,
//   drawDetection,
// } from 'face-api.js';
//const FaceDetectModel = loadSsdMobilenetv1Model;
// const FaceDetectOptions = (opts?: any) =>
//   new (SsdMobilenetv1Options as any)(opts);
import {
  detectAllFaces,
  loadTinyFaceDetectorModel,
  TinyFaceDetectorOptions,
  drawDetection,
} from 'face-api.js';
const FaceDetectModel = loadTinyFaceDetectorModel;
const FaceDetectOptions = (opts?: any) =>
  new (TinyFaceDetectorOptions as any)(opts);

export type RootActions = ActionType<typeof actions>;
export type RootState = {
  readonly faceOffPanel: FaceOffModel;
};

const drawDetections = (
  detection: any[],
  canvas: HTMLCanvasElement,
  srcWidth: number,
  srcHeight: number
) => {
  if (canvas) {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    //console.log({ width, height, videoWidth, videoHeight });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(~~((width - srcWidth) / 2.0), ~~((height - srcHeight) / 2.0));
    if (detection.length) {
      drawDetection(canvas, detection, { withScore: false });
      //console.log({ video: payload });
    }
    //observer.next(detectedVideoFaces(result));
  }
};

export const readAsImage = async (file: File): Promise<HTMLImageElement> => {
  const dataUrl = createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imgEl = new Image();
    imgEl.title = file.name;
    imgEl.onload = () => resolve(imgEl);
    imgEl.onerror = error => reject(error);
    imgEl.src = dataUrl;
  });
  if (img.width > MAX_WIDTH) {
    const newHeight = ~~((MAX_WIDTH * img.height) / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = MAX_WIDTH;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (ctx !== null) {
      ctx.drawImage(img, 0, 0, MAX_WIDTH, newHeight);
      const src = createObjectURL(await canvasToBlob(ctx.canvas, 'image/png'));
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgEl = new Image();
        imgEl.title = file.name;
        imgEl.onload = () => resolve(imgEl);
        imgEl.onerror = error => reject(error);
        imgEl.src = src;
        revokeObjectURL(dataUrl);
      });
    }
  }
  return img;
};

export const rootEpic = combineEpics(
  () =>
    fromEvent(window, 'paste').pipe(
      map((evt: ClipboardEvent) => evt.clipboardData.items),
      switchMap(items =>
        Observable.create(async observer => {
          const imageFiles = [];
          const videoFiles = [];
          for (let i = 0, iL = items.length; i < iL; i++) {
            const file = items[i];

            if (file.type === 'video/mp4') {
              videoFiles.push(createObjectURL(file));
            } else {
              imageFiles.push(await readAsImage(file));
            }
          }
          if (imageFiles.length) {
            observer.next(actions.addImages(imageFiles));
          }
          if (videoFiles.length) {
            observer.next(
              actions.fetchMp4Url(videoFiles[videoFiles.length - 1])
            );
            observer.next(actions.switchTab('one'));
          }
          observer.complete();
        })
      )
    ),
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(START_APP)),
      mapTo(fetchMp4Url(DEFAULT_VIDEO_URL))
    ),
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(START_APP)),
      switchMap(() =>
        FaceDetectModel(
          'https://justadudewhohacks.github.io/face-api.js/models/'
        )
      ),
      mapTo(loadedModels())
    ),
  (action$: Observable<RootActions>, state$: StateObservable<RootState>) =>
    action$.pipe(
      filter(isOfType(LOADED_MODELS)),
      tap(async () => {
        while (true) {
          try {
            const {
              faceOffPanel: { isAppRunning, tab },
            } = state$.value;
            if (!isAppRunning) {
              return;
            }
            switch (tab) {
              case 'one': {
                const {
                  faceOffPanel: {
                    videoRef: {
                      current: { videoWidth, videoHeight },
                    },
                    videoOverlayRef,
                    videoDetectResults,
                  },
                } = state$.value;
                drawDetections(
                  videoDetectResults,
                  videoOverlayRef.current,
                  videoWidth,
                  videoHeight
                );
                break;
              }
              case 'two': {
                const {
                  faceOffPanel: {
                    webcamRef,
                    webcamOverlayRef,
                    webcamDetectResults,
                  },
                } = state$.value;
                const {
                  current: {
                    video: { videoWidth, videoHeight },
                  },
                } = webcamRef as any;
                drawDetections(
                  webcamDetectResults,
                  webcamOverlayRef.current,
                  videoWidth,
                  videoHeight
                );
                break;
              }
            }
          } catch (ex) {}
          await timer(100).toPromise();
        }
      }),
      mapTo(detectFaces())
    ),
  (action$: Observable<RootActions>, state$: StateObservable<RootState>) =>
    action$.pipe(
      filter(isOfType(DETECT_FACES)),
      filter(() => state$.value.faceOffPanel.isAppRunning),
      switchMap(() =>
        Observable.create(async observer => {
          const {
            faceOffPanel: {
              tab,
              videoRef,
              webcamRef,
              videoOverlayRef,
              webcamOverlayRef,
              imagesOverlayRef,
              isVideoLoaded,
              isWebcamLoaded,
              images,
              imagesDetectResults,
            },
          } = state$.value;

          if (tab === 'one' && videoRef.current && isVideoLoaded) {
            //const result = await detectAllFaces(videoRef.current, new SsdMobilenetv1Options());
            const query = from(
              detectAllFaces(
                videoRef.current,
                FaceDetectOptions({ inputSize: 320 })
              )
            ).pipe(
              timeout(2000),
              catchError(() => of([]))
            );
            const result = await query.toPromise();
            observer.next(detectedVideoFaces(result));
          }

          if (
            tab === 'two' &&
            webcamRef.current &&
            (webcamRef.current as any).video &&
            isWebcamLoaded
          ) {
            //const result = await detectAllFaces(videoRef.current, new SsdMobilenetv1Options());
            const query = from(
              detectAllFaces(
                (webcamRef.current as any).video,
                FaceDetectOptions({ inputSize: 320 })
              )
            ).pipe(
              timeout(2000),
              catchError(() => of([]))
            );
            const result = await query.toPromise();
            const {
              videoWidth,
              videoHeight,
            } = (webcamRef.current as any).video;
            drawDetections(
              result,
              webcamOverlayRef.current,
              videoWidth,
              videoHeight
            );
            observer.next(detectedWebcamFaces(result));
          }

          for (let i = 0, iL = images.length; i < iL; i++) {
            const image = images[i];
            const { id } = image;
            if (id in imagesDetectResults) {
              continue;
            }
            const query = from(detectAllFaces(image, FaceDetectOptions())).pipe(
              timeout(2000),
              catchError(() => of([]))
            );
            const result = await query.toPromise();
            drawDetections(
              result,
              (imagesOverlayRef[id] || ({} as any)).current,
              image.width,
              image.height
            );
            observer.next(detectedImageFaces({ image, result }));
            await timer(100).toPromise();
          }
          await timer(100).toPromise();
          observer.next(detectFaces());
          observer.complete();
        })
      )
    ),
  (action$: Observable<RootActions>, state$: StateObservable<RootState>) =>
    action$.pipe(
      filter(isOfType(DETECTED_IMAGEFACES)),
      filter(() => state$.value.faceOffPanel.isAppRunning),
      tap(({ payload: { image, result } }) => {
        const {
          faceOffPanel: { imagesOverlayRef },
        } = state$.value;
        drawDetections(
          result,
          (imagesOverlayRef[image.id] || ({} as any)).current,
          image.width,
          image.height
        );
      }),
      ignoreElements()
    ),
  (action$: Observable<RootActions>, state$: StateObservable<RootState>) =>
    action$.pipe(
      filter(isOfType(FETCH_MP4URL)),
      switchMap(({ payload: videoUrl }) =>
        from(fetch(`${VIDEO_API}${videoUrl}`)).pipe(
          switchMap(result => result.json()),
          //tap(result => console.log(result)),
          map(result => result.filter(r => /^video\/mp4;/.test(r.type))),
          map(result =>
            !result.length
              ? fetchedMp4Url({
                  videoUrlLoaded: videoUrl,
                  mp4Url: videoUrl,
                })
              : fetchedMp4Url({
                  videoUrlLoaded: videoUrl,
                  mp4Url: result[result.length - 1].url,
                })
          )
        )
      )
    )
);

export const rootReducer = combineReducers<RootState, RootActions>({
  faceOffPanel(
    state = {
      isAppRunning: false,
      isModelsLoaded: false,
      isVideoLoaded: false,
      isWebcamLoaded: false,
      tab: 'one',
      message: '',
      facingMode: FACINGMODE_REAR,
      videoUrl: DEFAULT_VIDEO_URL,
      videoUrlLoaded: '',
      mp4Url: '',
      videoRef: createRef<HTMLVideoElement>(),
      webcamRef: createRef<Webcam>(),
      images: [],
      videoOverlayRef: createRef<HTMLCanvasElement>(),
      webcamOverlayRef: createRef<HTMLCanvasElement>(),
      imagesOverlayRef: {},
      imagesDetectResults: {},
      videoDetectResults: [],
      webcamDetectResults: [],
    },
    action: RootActions
  ) {
    switch (action.type) {
      case SWITCH_TAB: {
        const { payload: tab } = action;
        return { ...state, tab };
      }
      case SHOW_MESSAGE: {
        const { payload: message } = action;
        return { ...state, message };
      }
      case HIDE_MESSAGE: {
        return { ...state, message: null };
      }
      case ADD_IMAGES: {
        const { payload: images } = action;
        images.forEach(
          image =>
            (image.id =
              '_' +
              Math.random()
                .toString(36)
                .substr(2, 9))
        );
        return {
          ...state,
          images: [...state.images, ...images],
          imageFaceDetctResults: {
            ...state.imagesDetectResults,
            ...images.reduce((result, image) => {
              result[image.id] = null;
              return result;
            }, {}),
          },
          imagesOverlayRef: {
            ...state.imagesOverlayRef,
            ...images.reduce((result, image) => {
              result[image.id] = createRef<HTMLCanvasElement>();
              return result;
            }, {}),
          },
        };
      }
      case REMOVE_IMAGES: {
        const { payload: imageIndexes } = action;
        for (const imageIndex of imageIndexes) {
          const image = state.images[imageIndex];
          if (/^blob:/i.test(image.src)) {
            revokeObjectURL(image.src);
          }
        }
        const imageIds = state.images
          .filter((image, i) => imageIndexes.indexOf(i) < 0)
          .map(image => image.id);
        return {
          ...state,
          images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0),
          imagesDetectResults: imageIds.reduce((result, imageId) => {
            result[imageId] = state.imagesDetectResults[imageId];
            return result;
          }, {}),
          imagesOverlayRef: imageIds.reduce((result, imageId) => {
            result[imageId] = state.imagesOverlayRef[imageId];
            return result;
          }, {}),
        };
      }
      case SWITCH_FACINGMODE: {
        const { payload: facingMode } = action;
        return { ...state, facingMode };
      }
      case CHANGE_VIDEOURL: {
        const { payload: videoUrl } = action;
        return { ...state, videoUrl };
      }
      case FETCH_MP4URL: {
        const { payload: videoUrlBeforeTrim } = action;
        const { mp4Url: previousMp4Url } = state;
        const videoUrl = (videoUrlBeforeTrim || '').replace(/^\s+|\s+$/g, '');
        if (/^blob:/i.test(previousMp4Url) && previousMp4Url !== videoUrl) {
          revokeObjectURL(previousMp4Url);
        }
        return { ...state, videoUrl, mp4Url: '', isVideoLoaded: false };
      }
      case FETCHED_MP4URL: {
        const {
          payload: { videoUrlLoaded, mp4Url },
        } = action;
        return { ...state, videoUrlLoaded, mp4Url, isVideoLoaded: false };
      }
      case LOADED_MODELS: {
        return { ...state, isModelsLoaded: true };
      }
      case START_APP: {
        return { ...state, isAppRunning: true };
      }
      case STOP_APP: {
        for (const image of state.images) {
          if (/^blob:/i.test(image.src)) {
            revokeObjectURL(image.src);
          }
        }
        if (/^blob:/i.test(state.mp4Url)) {
          revokeObjectURL(state.mp4Url);
        }
        return {
          ...state,
          mp4Url: '',
          images: [],
          imagesDetectResults: [],
          isAppRunning: false,
        };
      }
      case DETECTED_VIDEOFACES: {
        const { payload: videoDetectResults } = action;
        return {
          ...state,
          videoDetectResults,
        };
      }
      case DETECTED_WEBCAMFACES: {
        const { payload: webcamDetectResults } = action;
        return {
          ...state,
          webcamDetectResults,
        };
      }
      case DETECTED_IMAGEFACES: {
        const {
          payload: {
            image: { id },
            result,
          },
        } = action;
        return {
          ...state,
          imagesDetectResults: Object.assign({}, state.imagesDetectResults, {
            [id]: result,
          }),
        };
      }
      case LOADED_VIDEO: {
        return { ...state, isVideoLoaded: true };
      }
      case LOADED_WEBCAM: {
        return { ...state, isWebcamLoaded: true };
      }
      default: {
        return state;
      }
    }
  },
});
