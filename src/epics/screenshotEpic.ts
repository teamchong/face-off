import { canvasToBlob, createObjectURL } from 'blob-util';
import { isActionOf } from 'typesafe-actions';
import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { addImages, RootActions, screenshotVideo } from '../actions';
import { MAX_HEIGHT, MAX_WIDTH, SCREENSHOT_VIDEO } from '../constants';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(screenshotVideo)),
    switchMap(({ payload: video }) =>
      Observable.create(async observer => {
        if (video && video.videoWidth) {
          const { videoWidth, videoHeight } = video;
          let width = videoWidth;
          let height = videoHeight;
          if (width > MAX_WIDTH) {
            height = ~~((MAX_WIDTH * height) / width);
            width = MAX_WIDTH;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas
            .getContext('2d')
            .drawImage(
              video,
              0,
              0,
              videoWidth,
              videoHeight,
              0,
              0,
              width,
              height
            );
          const src = createObjectURL(await canvasToBlob(canvas, 'image/png'));
          observer.next(
            addImages([
              await new Promise<HTMLImageElement>((resolve, reject) => {
                const imgEl = new Image();
                imgEl.title = `faceoff-${new Date()
                  .toLocaleString('en-GB')
                  .replace('/', '-')
                  .replace(/[,]/g, '')}.png`;
                imgEl.onload = () => resolve(imgEl);
                imgEl.onerror = error => reject(error);
                imgEl.src = src;
              }),
            ])
          );
        }
        observer.complete();
      })
    )
  );
