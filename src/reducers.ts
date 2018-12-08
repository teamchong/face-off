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
// import {
//   detectAllFaces,
//   loadSsdMobilenetv1Model,
//   SsdMobilenetv1Options,
// } from 'face-api.js';
import {
  detectAllFaces,
  loadTinyFaceDetectorModel,
  TinyFaceDetectorOptions,
} from 'face-api.js';
import { FaceOffModel } from './models';
import * as actions from './actions';
import {
  fetchMp4Url,
  fetchedMp4Url,
  loadedModels,
  detectFaces,
  detectedFaces,
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
  DETECTED_FACES,
  FACINGMODE_REAR,
  YOUTUBE_API,
  DEFAULT_YOUTUBE_URL,
  VIDEO_INDEX,
  WEBCAM_INDEX,
} from './constants';

export type RootActions = ActionType<typeof actions>;
export type RootState = {
  readonly faceOffPanel: FaceOffModel;
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
        //loadSsdMobilenetv1Model(
        loadTinyFaceDetectorModel(
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
      filter(() => state$.value.faceOffPanel.isAppStarted),
      switchMap(() =>
        Observable.create(async observer => {
          const { faceOffPanel } = state$.value;
          const {
            tab,
            videoRef,
            isVideoLoaded,
            images,
            imageDetectResults,
          } = faceOffPanel;

          if (tab === 'one' && videoRef.current && isVideoLoaded) {
            //const result = await detectAllFaces(videoRef.current, new SsdMobilenetv1Options());
            const query = from(
              detectAllFaces(videoRef.current, new TinyFaceDetectorOptions())
            ).pipe(
              timeout(2000),
              catchError(() => of([]))
            );
            const result = await query.toPromise();
            if (result.length) {
              console.log({ index: VIDEO_INDEX, result });
              observer.next(detectedFaces({ index: VIDEO_INDEX, result }));
            }
          }

          for (let i = 0, iL = images.length; i < iL; i++) {
            if (imageDetectResults[i]) {
              continue;
            }
            const query = from(
              detectAllFaces(images[i], new TinyFaceDetectorOptions())
            ).pipe(
              timeout(2000),
              catchError(() => of([]))
            );
            const result = await query.toPromise();
            if (result.length) {
              console.log({ [i]: result });
              observer.next(detectedFaces({ index: i, result }));
            }
          }
          await timer(500).toPromise();
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
      isAppStarted: false,
      tab: 'one',
      message: '',
      images: [],
      imageDetectResults: [],
      videoDetectResults: [],
      webcamDetectResults: [],
      facingMode: FACINGMODE_REAR,
      youtubeUrl: DEFAULT_YOUTUBE_URL,
      youtubeUrlLoaded: '',
      mp4Url: '',
      videoRef: createRef<HTMLVideoElement>(),
      webcamRef: createRef<Webcam>(),
      isModelsLoaded: false,
      isVideoLoaded: false,
      isWebcamLoaded: false,
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
        const imageDetectResults = images.map(() => null);
        return {
          ...state,
          images: [...state.images, ...images],
          imageFaceDetctResults: [
            ...state.imageDetectResults,
            ...imageDetectResults,
          ],
        };
      }
      case REMOVE_IMAGES: {
        const { payload: imageIndexes } = action;
        return {
          ...state,
          images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0),
          imageDetectResults: state.imageDetectResults.filter(
            (img, i) => imageIndexes.indexOf(i) < 0
          ),
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
        return { ...state, isAppStarted: true };
      }
      case STOP_APP: {
        return { ...state, isAppStarted: false };
      }
      case DETECT_FACES: {
        return { ...state };
      }
      case DETECTED_FACES: {
        const { index, result } = action.payload;
        if (index === VIDEO_INDEX) {
          return {
            ...state,
            videoDetectResults: result,
          };
        } else if (index === WEBCAM_INDEX) {
          return {
            ...state,
            webcamDetectResults: result,
          };
        } else {
          return {
            ...state,
            imageDetectResults: Object.assign([], state.imageDetectResults, {
              [index]: result,
            }),
          };
        }
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
