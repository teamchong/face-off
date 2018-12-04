import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';
import { CamPanelModel } from './models';
import * as actions from './actions';
import {
  SWITCHTAB_CAMPANEL,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES
} from './constants';

export type AppActions = ActionType<typeof actions>;
export type AppState = {
  readonly camPanel: CamPanelModel;
};

export default combineReducers<AppState, AppActions>({
  camPanel: (state = { tab: 'one', message: null, images: [] }, action) => {
    switch (action.type) {
      case SWITCHTAB_CAMPANEL:
        const { payload: tab } = action;
        return { ...state, ...{ tab } };
      case SHOW_MESSAGE:
        const { payload: message } = action;
        return { ...state, ...{ message } };
      case HIDE_MESSAGE:
        return { ...state, ...{ message: null } };
      case ADD_IMAGES:
        const { payload: images } = action;
        return { ...state, ...{ images: [...state.images, ...images] } };
      case REMOVE_IMAGES:
        const { payload: imageIndexes } = action;
        return {
          ...state,
          ...{
            images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0)
          }
        };
      default:
        return state;
    }
  }
});
