import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { combineLatest, from } from 'rxjs';
import { tap, ignoreElements, filter, map, switchMap } from 'rxjs/operators';
import { ActionType, isOfType } from 'typesafe-actions';
import { CameraPanelModel } from './models';
import * as actions from './actions';
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
  YOUTUBE_API
} from './constants';

export type RootActions = ActionType<typeof actions>;
export type RootState = {
  readonly cameraPanel: CameraPanelModel;
};

export const rootEpic = combineEpics((action$, state$) =>
  combineLatest(action$, state$).pipe(
    filter(([action]) => isOfType(FETCH_MP4URL)(action)),
    switchMap(([{ payload: youtubeUrl }]) =>
      from(fetch(`${YOUTUBE_API}${youtubeUrl}`)).pipe(
        switchMap(result => result.json()),
        map(result => result.filter(r => /^video\/mp4;/.test(r.type))),
        filter(result => !!result.length),
        map(result =>
          actions.fetchedMp4Url({
            youtubeUrl,
            mp4Url: result[result.length - 1].url
          })
        )
      )
    )
  )
);

export const rootReducer = combineReducers<RootState, RootActions>({
  cameraPanel(state = null, action) {
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
          images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0)
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
        const { youtubeUrl, mp4Url } = action.payload;
        return { ...state, youtubeUrl, mp4Url };
      }
      default:
        return state;
    }
  }
});
