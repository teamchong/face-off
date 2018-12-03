import appReducers from './reducers';
import { applyMiddleware, createStore } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

export default () => {
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(appReducers, applyMiddleware(epicMiddleware));
  epicMiddleware.run(combineEpics());
  return store;
};
