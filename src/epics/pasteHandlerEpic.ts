import { createObjectURL } from 'blob-util';
import { fromEvent, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { readAsImage } from '../classes/fileApi';
import { addImages, fetchMp4Url, switchTab } from '../actions';

export default () =>
  fromEvent(window, 'paste').pipe(
    map((evt: ClipboardEvent) => evt.clipboardData.items),
    mergeMap(items =>
      Observable.create(async observer => {
        const imageFiles = [];
        const videoFiles = [];
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
    )
  );
