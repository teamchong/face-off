import { canvasToBlob, createObjectURL } from 'blob-util';
import { isActionOf } from 'typesafe-actions';
import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { addImages, RootActions, screenshotVideo } from '../actions';
import { SCREENSHOT_VIDEO } from '../constants';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(screenshotVideo)),
    switchMap(async ({ payload: video }) => {
      if (video) {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = video.videoWidth;
        ctx.canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const src = createObjectURL(
          await canvasToBlob(video.canvas, 'image/png')
        );
        if (videoWidth > MAX_WIDTH) {
          videoHeight = ~~((MAX_WIDTH * videoHeight) / videoWidth);
          videoWidth = MAX_WIDTH;
        }
        return addImages([
          await new Promise<HTMLImageElement>((resolve, reject) => {
            const imgEl = new Image();
            imgEl.title = `faceoff-${new Date()
              .toLocaleString('en-GB')
              .replace('/', '-')
              .replace(/[,]/g, '')}.jpg`;
            imgEl.onload = () => resolve(imgEl);
            imgEl.onerror = error => reject(error);
            imgEl.src = src;
          }),
        ]);
      }
    })
  );
