import { createRef } from 'react';
import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { combineLatest, empty, from, interval, Observable } from 'rxjs';
import {
  tap,
  ignoreElements,
  filter,
  map,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { ActionType, isOfType } from 'typesafe-actions';
import * as faceapi from 'face-api.js';
import { CameraPanelModel } from './models';
import * as actions from './actions';
import { fetchMp4Url, fetchedMp4Url, loadedModels } from './actions';
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
  LOADED_MODELS,
  FACINGMODE_REAR,
  YOUTUBE_API,
  DEFAULT_YOUTUBE_URL,
} from './constants';

export type RootActions = ActionType<typeof actions>;
export type RootState = {
  readonly cameraPanel: CameraPanelModel;
};

export const rootEpic = combineEpics(
  (action$: Observable) =>
    action$.pipe(
      filter(isOfType(APP_START)),
      switchMap(() =>
        from(
          faceapi.loadTinyFaceDetectorModel(
            'https://justadudewhohacks.github.io/face-api.js/models/'
          )
        )
      ),
      map(() => loadedModels())
    ),
  (action$: Observable) =>
    action$.pipe(
      filter(isOfType(APP_START)),
      map(() => fetchMp4Url(DEFAULT_YOUTUBE_URL))
    ),
  (action$: Observable, state$: Observable) =>
    combineLatest(action$, state$).pipe(
      filter(([action]) => isOfType(LOADED_MODELS)(action)),
      switchMap(([_, { cameraPanel }]) =>
        interval(1000).pipe(
          tap(props => {
            console.log(cameraPanel);
          }),
          switchMap(() => empty())
        )
      ),
      switchMap(() => empty())
    ),
  (action$: Observable, state$: Observable) =>
    combineLatest(action$, state$).pipe(
      filter(([action]) => isOfType(FETCH_MP4URL)(action)),
      switchMap(([{ payload: youtubeUrl }]) =>
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
        const { payload: youtubeUrl } = action;
        return { ...state, youtubeUrl, mp4Url: '' };
      }
      case FETCHED_MP4URL: {
        const { youtubeUrlLoaded, mp4Url } = action.payload;
        return { ...state, youtubeUrlLoaded, mp4Url };
      }
      case LOADED_MODELS: {
        return { ...state, modelsLoaded: true };
      }
      case APP_START:
      default:
        return state;
    }
  },
});
