import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';
import { CamPanelModel } from './models';
import * as actions from './actions';
import {
  SWITCHTAB_CAMPANEL,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES,
  SWITCH_FACINGMODE,
  FACINGMODE_REAR
} from './constants';

export type AppActions = ActionType<typeof actions>;
export type AppState = {
  readonly cameraPanel: CamPanelModel;
};

export default combineReducers<AppState, AppActions>({
  cameraPanel: (
    state = {
      tab: 'one',
      message: null,
      images: [],
      facingMode: FACINGMODE_REAR
    },
    action
  ) => {
    switch (action.type) {
      case SWITCHTAB_CAMPANEL:
        const { payload: tab } = action;
        return { ...state, tab };
      case SHOW_MESSAGE:
        const { payload: message } = action;
        return { ...state, message };
      case HIDE_MESSAGE:
        return { ...state, message: null };
      case ADD_IMAGES:
        const { payload: images } = action;
        return { ...state, images: [...state.images, ...images] };
      case REMOVE_IMAGES:
        const { payload: imageIndexes } = action;
        return {
          ...state,
          images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0)
        };
      case SWITCH_FACINGMODE:
        const { payload: facingMode } = action;
        return { ...state, facingMode };
        break;
      default:
        return state;
    }
  }
});
