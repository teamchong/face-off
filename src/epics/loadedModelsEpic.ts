import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, mapTo, tap, timer } from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';
import { detectFaces, RootActions } from '../actions';
import { drawDetections } from '../classes/drawing';
import { LOADED_MODELS } from '../constants';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isOfType(LOADED_MODELS)),
    tap(async () => {
      while (true) {
        try {
          const {
            faceOffPanel: {
              tab,
              videoCtx,
              videoDetectResults,
              videoOverlayRef,
              webcamOverlayRef,
            },
          } = state$.value;
          const overlay =
            tab == 'one'
              ? videoOverlayRef.current
              : tab == 'two'
              ? webcamOverlayRef.current
              : null;
          drawDetections(
            videoDetectResults,
            overlay,
            videoCtx.canvas.width,
            videoCtx.canvas.height
          );
        } catch (ex) {}
        await timer(100).toPromise();
      }
    }),
    mapTo(detectFaces())
  );
