import { StateObservable } from 'redux-observable';
import { from, Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';
import { fetchedMp4Url, RootActions } from '../actions';
import { FETCH_MP4URL, VIDEO_API } from '../constants';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isOfType(FETCH_MP4URL)),
    switchMap(({ payload: videoUrl }) =>
      from(fetch(`${VIDEO_API}${videoUrl}`)).pipe(
        switchMap(result => result.json()),
        tap(result => console.log(result)),
        map(result => result.filter(r => /^video\/(?:mp4|webm);/.test(r.type))),
        map(result =>
          !result.length
            ? fetchedMp4Url({
                videoUrlLoaded: videoUrl,
                mp4Url: videoUrl,
              })
            : fetchedMp4Url({
                videoUrlLoaded: videoUrl,
                mp4Url: result[result.length - 1].url,
              })
        )
      )
    )
  );
