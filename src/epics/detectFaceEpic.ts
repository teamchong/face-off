import { StateObservable } from 'redux-observable';
import { concat, empty, from, ignoreElements, Observable, of } from 'rxjs';
import {
  catchError,
  delay,
  expand,
  filter,
  first,
  map,
  switchMap,
  takeWhile,
  tap,
  timeout,
} from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';
import {
  detectedImageFaces,
  detectedVideoFaces,
  detectedWebcamFaces,
  RootActions,
} from '../actions';
import { drawDetections } from '../classes/drawing';
import { DETECT_FACES } from '../constants';
import { RootState } from '../models';

// import { detectAllFaces, SsdMobilenetv1Options } from 'face-api.js';
//const FaceDetectModel = loadSsdMobilenetv1Model;
//const FaceDetectOptions = (opts?: any) =>
// new (SsdMobilenetv1Options as any)(opts);
import { detectAllFaces, TinyFaceDetectorOptions } from 'face-api.js';
const FaceDetectOptions = (opts?: any) =>
  new (TinyFaceDetectorOptions as any)(opts);

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isOfType(DETECT_FACES)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    expand(action =>
      concat(
        of(state$.value.faceOffPanel).pipe(
          switchMap(action => {
            let {
              tab,
              videoRef: { current: video },
              webcamRef: { current: webcamRef },
            } = action;

            if (tab == 'one' && video) {
              const { videoWidth, videoHeight } = video;
              return of({ ...action, videoWidth, videoHeight }).pipe(
                switchMap(({ overlay, videoCtx, videoWidth, videoHeight }) => {
                  videoCtx.canvas.width = videoWidth;
                  videoCtx.canvas.height = videoHeight;
                  videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
                  return from(
                    detectAllFaces(
                      videoCtx.canvas,
                      FaceDetectOptions({ inputSize: 320 })
                    )
                  ).pipe(
                    map(result => detectedVideoFaces(result)),
                    timeout(2000),
                    catchError(() => detectedVideoFaces([])),
                    tap(({ payload: results }) => {
                      if (overlay) {
                        drawDetections(
                          results,
                          overlay,
                          videoCtx.canvas.width,
                          videoCtx.canvas.height
                        );
                      }
                    }),
                    delay(100)
                  );
                })
              );
            } else if (tab === 'two' && webcamRef) {
              const { videoWidth, videoHeight } = webcamRef.video;
              return of({ ...action, videoWidth, videoHeight }).pipe(
                switchMap(({ overlay, videoCtx, video }) => {
                  videoCtx.canvas.width = videoWidth;
                  videoCtx.canvas.height = videoHeight;
                  videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
                  return from(
                    detectAllFaces(
                      videoCtx.canvas,
                      FaceDetectOptions({ inputSize: 320 })
                    )
                  ).pipe(
                    map(result => detectedWebcamFaces(result)),
                    timeout(2000),
                    catchError(() => detectedWebcamFaces([])),
                    tap(({ payload: results }) => {
                      if (overlay) {
                        drawDetections(
                          results,
                          overlay,
                          videoCtx.canvas.width,
                          videoCtx.canvas.height
                        );
                      }
                    }),
                    delay(100)
                  );
                })
              );
            }
            return of(null).pipe(
              delay(100),
              ignoreElements()
            );
          })
        ),
        of(state$.value.faceOffPanel).pipe(
          switchMap(({ images, imagesDetectResults, imagesOverlay }) =>
            of(
              images.map((image, i) => ({
                id: image.id,
                image,
                i,
                overlay: imagesOverlay[image.id],
                results: imagesDetectResults[image.id],
              }))
            )
          ),
          filter(({ results }) => !!results),
          switchMap(({ id, image, i, overlay, results }) =>
            from(
              detectAllFaces(image, FaceDetectOptions({ inputSize: 608 }))
            ).pipe(
              map(result => detectedImageFaces({ image, result })),
              timeout(2000),
              catchError(() => detectedImageFaces({ image, result: [] })),
              tap(({ payload: results }) => {
                if (overlay) {
                  drawDetections(
                    results,
                    overlay,
                    overlay.width,
                    overlay.height
                  );
                }
              }),
              delay(100)
            )
          )
        )
      )
    ),
    takeWhile(() => state$.value.faceOffPanel.isAppRunning)
  );
