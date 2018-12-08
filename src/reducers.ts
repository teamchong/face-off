import { createRef } from 'react';
import * as Webcam from 'react-webcam';
import { combineReducers } from 'redux';
import { combineEpics, StateObservable } from 'redux-observable';
import {
  combineLatest,
  concat,
  empty,
  from,
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
  CHANGE_YOUTUBEURL,
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
  YOUTUBE_API,
  DEFAULT_YOUTUBE_URL,
} from './constants';

// import {
//   detectAllFaces,
//   loadSsdMobilenetv1Model,
//   SsdMobilenetv1Options,
//   drawDetection,
// } from 'face-api.js';
//const FaceDetectModel = loadSsdMobilenetv1Model;
//const FaceDetectOptions = new SsdMobilenetv1Options();
import {
  detectAllFaces,
  loadTinyFaceDetectorModel,
  TinyFaceDetectorOptions,
  drawDetection,
} from 'face-api.js';
const FaceDetectModel = loadTinyFaceDetectorModel;
const FaceDetectOptions = new TinyFaceDetectorOptions();
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

export const rootEpic = combineEpics(
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(START_APP)),
      mapTo(fetchMp4Url(DEFAULT_YOUTUBE_URL))
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
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(LOADED_MODELS)),
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
              detectAllFaces(videoRef.current, FaceDetectOptions)
            ).pipe(
              timeout(2000),
              catchError(() => of([]))
            );
            const result = await query.toPromise();
            const { videoWidth, videoHeight } = videoRef.current;
            drawDetections(
              result,
              videoOverlayRef.current,
              videoWidth,
              videoHeight
            );
            observer.next(detectedVideoFaces(result));
          }

          if (
            tab === 'three' &&
            webcamRef.current &&
            (webcamRef.current as any).video &&
            isWebcamLoaded
          ) {
            //const result = await detectAllFaces(videoRef.current, new SsdMobilenetv1Options());
            const query = from(
              detectAllFaces(
                (webcamRef.current as any).video,
                FaceDetectOptions
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
            const query = from(detectAllFaces(image, FaceDetectOptions)).pipe(
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
            observer.next(detectedImageFaces({ id, result }));
          }
          await timer(100).toPromise();
          observer.next(detectFaces());
          observer.complete();
        })
      )
    ),
  (action$: Observable<RootActions>, state$: StateObservable<RootState>) =>
    action$.pipe(
      filter(isOfType(FETCH_MP4URL)),
      switchMap(({ payload: youtubeUrl }) =>
        from(fetch(`${YOUTUBE_API}${youtubeUrl}`)).pipe(
          switchMap(result => result.json()),
          map(result => result.filter(r => /^video\/mp4;/.test(r.type))),
          filter(result => !!result.length),
          map(result =>
            fetchedMp4Url({
              youtubeUrlLoaded: youtubeUrl,
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
      youtubeUrl: DEFAULT_YOUTUBE_URL,
      youtubeUrlLoaded: '',
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
      case CHANGE_YOUTUBEURL: {
        const { payload: youtubeUrl } = action;
        return { ...state, youtubeUrl };
      }
      case FETCH_MP4URL: {
        const { payload: youtubeUrlBeforeTrim } = action;
        const youtubeUrl = (youtubeUrlBeforeTrim || '').replace(
          /^\s+|\s+$/g,
          ''
        );
        return { ...state, youtubeUrl, mp4Url: '', isVideoLoaded: false };
      }
      case FETCHED_MP4URL: {
        const { youtubeUrlLoaded, mp4Url } = action.payload;
        return { ...state, youtubeUrlLoaded, mp4Url, isVideoLoaded: false };
      }
      case LOADED_MODELS: {
        return { ...state, isModelsLoaded: true };
      }
      case START_APP: {
        return { ...state, isAppRunning: true };
      }
      case STOP_APP: {
        return { ...state, isAppRunning: false };
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
          payload: { id, result },
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
