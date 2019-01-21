import { canvasToBlob, createObjectURL } from 'blob-util';
import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { addImages, RootActions, screenshotVideo } from '../actions';
import { MAX_HEIGHT, MAX_WIDTH, SCREENSHOT_VIDEO } from '../constants';
import { IRootState } from '../models';

export default (action$: Observable<RootActions>, state$: StateObservable<IRootState>): Observable<RootActions> =>
  action$.pipe(
    filter(isActionOf(screenshotVideo)),
    switchMap(({ payload: video }) =>
      Observable.create(async observer => {
        if (video && video.videoWidth) {
          const { videoWidth, videoHeight } = video;
          let width = videoWidth;
          let height = videoHeight;
          if (width > MAX_WIDTH) {
            // tslint:disable-next-line:no-bitwise
            height = ~~((MAX_WIDTH * height) / width);
            width = MAX_WIDTH;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas
            .getContext('2d')!
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
          const imgEl = new Image();
          imgEl.title = `screenshot-${new Date()
            .toLocaleString('en-GB')
            .replace('/', '-')
            .replace(/[,]/g, '')}.png`;
          imgEl.src = src;
          imgEl.width = canvas.width;
          imgEl.height = canvas.height;
          observer.next(addImages([imgEl]));
        }
        observer.complete();
      })
    )
  );
