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
  switchMap,
  tap,
} from 'rxjs/operators';
import { ActionType, isOfType } from 'typesafe-actions';
import * as faceapi from 'face-api.js';
import { CameraPanelModel } from './models';
import * as actions from './actions';
import {
  fetchMp4Url,
  fetchedMp4Url,
  loadedModels,
  detectFaces,
} from './actions';
import * as faceapi from 'face-api.js';
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
  APP_START,
  APP_STOP,
  LOADED_MODELS,
  DETECT_FACES,
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
      filter(isOfType(APP_START)),
      map(() => fetchMp4Url(DEFAULT_YOUTUBE_URL))
    ),
  (action$: Observable<RootActions>) =>
    action$.pipe(
      filter(isOfType(APP_START)),
      switchMap(() =>
        from(
          faceapi.loadSsdMobilenetv1Model(
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
        return cameraPanel.appStarted;
      }),
      switchMap(() => {
        const { cameraPanel } = state$.value;
        const { tab, videoRef } = cameraPanel;
        if (tab === 'one' && videoRef.current) {
          return from(
            faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.SsdMobilenetv1Options()
            )
          ).pipe(
            map(result => {
              
            })
          );
        }
        return of([]);
      }),
      concatMap(() => of(detectFaces()).pipe(delay(1000)))
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
      appStarted: false,
      tab: 'one',
      message: '',
      images: [],
      facingMode: FACINGMODE_REAR,
      youtubeUrl: DEFAULT_YOUTUBE_URL,
      youtubeUrlLoaded: '',
      mp4Url: '',
      videoRef: createRef<HTMLVideoElement>(),
      modelsLoaded: false,
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
        return { ...state, modelsLoaded: true };
      }
      case APP_START: {
        return { ...state, appStarted: true };
      }
      case APP_STOP: {
        return { ...state, appStarted: false };
      }
      case DETECT_FACES:
      default:
        return state;
    }
  },
});
