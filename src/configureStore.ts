import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { fromEvent } from 'rxjs';
import { rootEpic, rootReducer } from './reducers';
import { appStart, appStop } from './actions';

export default () => {
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(rootReducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  store.dispatch(appStart());
  fromEvent(window, 'beforeunload').subscribe(() => store.dispatch(appStop()));
  return store;
};
