import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { fromEvent } from 'rxjs';
import { rootEpic, rootReducer } from './reducers';
import { startApp, stopApp } from './actions';

export default () => {
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(rootReducer, applyMiddleware(epicMiddleware));
  epicMiddleware.run(rootEpic);
  store.dispatch(startApp());
  fromEvent(window, 'beforeunload').subscribe(() => store.dispatch(stopApp()));
  return store;
};
