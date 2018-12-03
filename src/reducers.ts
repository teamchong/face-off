import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';
import { CamPanelModel } from './models';
import * as actions from './actions';
import { SWITCHTAB_CAMPANEL } from './constants';

export type AppActions = ActionType<typeof actions>;
export type AppState = {
  readonly camPanel: CamPanelModel;
};

export default combineReducers<AppState, AppActions>({
  camPanel: (state = { tab: 'one' }, action) => {
    switch (action.type) {
      case SWITCHTAB_CAMPANEL:
        const { payload: tab } = action;
        return { ...state, ...{ tab } };

      default:
        return state;
    }
  }
});
