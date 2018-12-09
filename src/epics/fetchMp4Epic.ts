import { StateObservable } from 'redux-observable';
import { from, Observable } from 'rxjs';
import { concat, filter, map, switchMap, tap } from 'rxjs/operators';
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
    switchMap(async ({ payload: videoUrl }) => {
      const result = await fetch(`${VIDEO_API}${videoUrl}`);
      const json = await result.json();
      console.log(json);
      const mp4List = json.filter(r => /^video\/(?:mp4|webm);/.test(r.type));
      if (!mp4List.length) {
        return fetchedMp4Url({
          videoUrlLoaded: videoUrl,
          mp4Url: videoUrl,
        });
      } else {
        return fetchedMp4Url({
          videoUrlLoaded: videoUrl,
          mp4Url: mp4List[mp4List.length - 1].url,
        });
      }
    })
  );
