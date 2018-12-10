import { forkJoin, from, Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  detectFaces,
  fetchMp4Url,
  loadedModels,
  RootActions,
  startApp,
} from '../actions';
import { initializeModles } from '../classes/faceApi';
import { DEFAULT_VIDEO_URL } from '../constants';

export default (action$: Observable<RootActions>) =>
  action$.pipe(
    filter(isActionOf(startApp)),
    switchMap(() =>
      Observable.create(async observer => {
        observer.next(fetchMp4Url(DEFAULT_VIDEO_URL));
        await initializeModles();
        observer.next(loadedModels());
        observer.next(detectFaces());
        observer.complete();
      })
    )
  );
