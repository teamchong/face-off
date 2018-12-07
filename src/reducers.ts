import { createRef } from 'react';
import { combineReducers } from 'redux';
import { combineEpics, StateObservable } from 'redux-observable';
import { combineLatest, empty, from, interval, of, Observable } from 'rxjs';
import {
  catchError,
  concatMap,
  delay,
  filter,
  map,
  mergeMap,
  last,
  switchMap,
  delayWhen,
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
import { CameraPanelModel } from './models';
import * as actions from './actions';
import {
  fetchMp4Url,
  fetchedMp4Url,
  loadedModels,
  detectFaces,
  detectedFaces,
} from './actions';
import {
  SWITCHTAB_CAMERAPANEL,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES,
  SWITCH_FACINGMODE,
  CHANGE_YOUTUBEURL,
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
} from './constants';

export type RootActions = ActionType<typeof actions>;
export type RootState = {
  readonly cameraPanel: CameraPanelModel;
};

export const rootEpic = combineEpics(
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(START_APP)),
      map(() => fetchMp4Url(DEFAULT_YOUTUBE_URL))
    ),
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(START_APP)),
      switchMap(() =>
        from(
          //loadSsdMobilenetv1Model(
          loadTinyFaceDetectorModel(
            'https://justadudewhohacks.github.io/face-api.js/models/'
          )
        )
      ),
      map(() => loadedModels())
    ),
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(LOADED_MODELS)),
      map(() => detectFaces())
    ),
  (action$: Observable<RootActions>, state$: StateObservable<RootState>) =>
    action$.pipe(
      filter(isOfType(DETECT_FACES)),
      filter(() => {
        const { cameraPanel } = state$.value;
        const { isAppStarted } = cameraPanel;
        return isAppStarted;
      }),
      concatMap(() => {
        const { cameraPanel } = state$.value;
        const { tab, videoRef } = cameraPanel;
        if (tab === 'one' && videoRef.current) {
          return from(
            //detectAllFaces(videoRef.current, new SsdMobilenetv1Options())
            detectAllFaces(videoRef.current, new TinyFaceDetectorOptions())
          ).pipe(
            tap(result => {
              console.log(result);
            })
          );
        }
        return of([]);
      }),
      map(() => detectedFaces()),
      last()
    ),
  (action$: Observable<RootActions>, state$: StateObservable<RootState>) =>
    action$.pipe(
      filter(isOfType(DETECTED_FACES)),
      filter(() => {
        const { cameraPanel } = state$.value;
        const { isAppStarted, isModelsLoaded } = cameraPanel;
        return isAppStarted && isModelsLoaded;
      }),
      delay(1000),
      map(() => detectFaces())
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
  cameraPanel(
    state = {
      isAppStarted: false,
      tab: 'one',
      message: '',
      images: [],
      facingMode: FACINGMODE_REAR,
      youtubeUrl: DEFAULT_YOUTUBE_URL,
      youtubeUrlLoaded: '',
      mp4Url: '',
      videoRef: createRef<HTMLVideoElement>(),
      isModelsLoaded: false,
      isFaceDetecting: false,
    },
    action
  ) {
    switch (action.type) {
      case SWITCHTAB_CAMERAPANEL: {
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
        return { ...state, images: [...state.images, ...images] };
      }
      case REMOVE_IMAGES: {
        const { payload: imageIndexes } = action;
        return {
          ...state,
          images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0),
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
        return { ...state, youtubeUrl, mp4Url: '' };
      }
      case FETCHED_MP4URL: {
        const { youtubeUrlLoaded, mp4Url } = action.payload;
        return { ...state, youtubeUrlLoaded, mp4Url };
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
        return { ...state, isFaceDetecting: true };
      }
      case DETECTED_FACES: {
        return { ...state, isFaceDetecting: false };
      }
      default: {
        return state;
      }
    }
  },
});
