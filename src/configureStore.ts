import { rootEpic, rootReducer, RootState } from './reducers';
import { applyMiddleware, createStore } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { appStart } from './actions';

export default () => {
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(rootReducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  store.dispatch(appStart());
  return store;
};
