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
    switchMap(async () => {
      const {
        faceOffPanel: { videoCtx },
      } = state$.value;
      const src = createObjectURL(
        await canvasToBlob(videoCtx.canvas, 'image/png')
      );
      return addImages([
        await new Promise<HTMLImageElement>((resolve, reject) => {
          const imgEl = new Image();
          imgEl.title = `WebCam-${new Date()
            .toLocaleString('en-GB')
            .replace('/', '-')
            .replace(/[,]/g, '')}.jpg`;
          imgEl.onload = () => resolve(imgEl);
          imgEl.onerror = error => reject(error);
          imgEl.src = src;
        }),
      ]);
    })
  );
