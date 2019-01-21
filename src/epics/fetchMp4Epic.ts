import { StateObservable } from 'redux-observable';
import { from, Observable } from 'rxjs';
import { concat, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { fetchedMp4Url, fetchMp4Url, RootActions } from '../actions';
import { VIDEO_API } from '../constants';
import { IRootState } from '../models';

export default (action$: Observable<RootActions>, state$: StateObservable<IRootState>): Observable<RootActions> =>
  action$.pipe(
    filter(isActionOf(fetchMp4Url)),
    switchMap(async ({ payload: videoUrl }) => {
      const result = await fetch(`${VIDEO_API}${videoUrl}`);
      const json = await result.json();
      // tslint:disable-next-line:no-console
      console.log(json);
      const mp4List = json.filter(r => /^video\/(?:mp4|webm);/.test(r.type));
      if (!mp4List.length) {
        return fetchedMp4Url({
          mp4Url: videoUrl,
          videoUrlLoaded: videoUrl,
        });
      } else {
        return fetchedMp4Url({
          mp4Url: mp4List[mp4List.length - 1].url,
          videoUrlLoaded: videoUrl,
        });
      }
    })
  );
