import { StateObservable } from 'redux-observable';
import { forkJoin, from, Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  detectVideoFaces,
  fetchMp4Url,
  loadedModels,
  RootActions,
  startApp,
} from '../actions';
import { initializeModels } from '../classes/faceApi';
import { DEFAULT_VIDEO_URL } from '../constants';
import { IRootState } from '../models';

export default (action$: Observable<RootActions>, state$: StateObservable<IRootState>): Observable<RootActions> =>
  action$.pipe(
    filter(isActionOf(startApp)),
    switchMap(() =>
      Observable.create(async observer => {
        observer.next(fetchMp4Url(DEFAULT_VIDEO_URL));
        await initializeModels();
        observer.next(loadedModels());
        observer.next(detectVideoFaces());
        observer.complete();
      })
    )
  );
