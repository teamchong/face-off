import { rootEpic, rootReducer, RootState } from './reducers';
import { applyMiddleware, createStore } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { fetchMp4Url } from './actions';
import { FACINGMODE_REAR, DEFAULT_YOUTUBE_URL } from './constants';

const initState: RootState = {
  cameraPanel: {
    tab: 'one',
    message: '',
    images: [],
    facingMode: FACINGMODE_REAR,
    youtubeUrl: DEFAULT_YOUTUBE_URL,
    mp4Url: ''
  }
};

export default () => {
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(
    rootReducer,
    initState,
    applyMiddleware(epicMiddleware)
  );
  epicMiddleware.run(rootEpic);
  store.dispatch(fetchMp4Url(DEFAULT_YOUTUBE_URL));
  return store;
};
