import { createObjectURL } from 'blob-util';
import { StateObservable } from 'redux-observable';
import { fromEvent, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { addImages, fetchMp4Url, RootActions, switchTab } from '../actions';
import { readAsImage } from '../classes/fileApi';
import { IRootState } from '../models';

export default (action$: Observable<RootActions>, state$: StateObservable<IRootState>): Observable<RootActions> =>
  fromEvent(window, 'paste').pipe(
    map((evt: Event) => (evt as ClipboardEvent).clipboardData.items),
    mergeMap(items =>
      Observable.create(async observer => {
        const imageFiles: HTMLImageElement[] = [];
        const videoFiles: string[] = [];
        for (let i = 0, iL = items.length; i < iL; i++) {
          const file = items[i].getAsFile();

          if (!file) {
            continue;
          }
          if (/^video\/(?:mp4|webm)$/i.test(file.type)) {
            videoFiles.push(createObjectURL(file));
          } else if (/^image\/.+$/i.test(file.type)) {
            imageFiles.push(await readAsImage(file));
          }
        }
        if (imageFiles.length) {
          observer.next(addImages(imageFiles));
        }
        if (videoFiles.length) {
          observer.next(fetchMp4Url(videoFiles[videoFiles.length - 1]));
          observer.next(switchTab('one'));
        }
        observer.complete();
      })
    ),
  );
