import { StateObservable } from 'redux-observable';
import { from, Observable, of, timer } from 'rxjs';
import {
  catchError,
  concat,
  delay,
  expand,
  filter,
  first,
  map,
  mapTo,
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
    switchMap(action =>
      Observable.create(async observer => {
        let state = state$.value.faceOffPanel;
        while (state.isAppRunning) {
          // console.log(`${new Date().toLocaleTimeString('enGb')} 1`);
          let {
            tab,
            videoRef: { current: video },
            videoOverlayRef: { current: videoOverlay },
            webcamRef: { current: webcam },
            webcamOverlayRef: { current: webcamOverlay },
            videoCtx,
            images,
            imagesOverlayRef,
            imagesDetectResults,
          } = state$.value.faceOffPanel;

          if (tab == 'one' && video && video.videoWidth) {
            const { videoWidth, videoHeight } = video;
            videoCtx.canvas.width = videoWidth;
            videoCtx.canvas.height = videoHeight;
            videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
            const result = await from(
              detectAllFaces(
                videoCtx.canvas,
                FaceDetectOptions({ inputSize: 320 })
              )
            )
              .pipe(
                timeout(2000),
                catchError(() => of([]))
              )
              .toPromise();

            drawDetections(
              result,
              videoOverlay,
              videoCtx.canvas.width,
              videoCtx.canvas.height
            );
            observer.next(detectedVideoFaces(result));

            await timer(100).toPromise();
          } else if (
            tab === 'two' &&
            webcam &&
            (webcam as any).video.videoWidth
          ) {
            const { videoWidth, videoHeight } = (webcam as any).video;
            videoCtx.canvas.width = videoWidth;
            videoCtx.canvas.height = videoHeight;
            videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
            const result = await from(
              detectAllFaces(
                videoCtx.canvas,
                FaceDetectOptions({ inputSize: 320 })
              )
            )
              .pipe(
                timeout(2000),
                catchError(() => of([]))
              )
              .toPromise();

            drawDetections(
              result,
              webcamOverlay,
              videoCtx.canvas.width,
              videoCtx.canvas.height
            );
            observer.next(detectedWebcamFaces(result));

            await timer(100).toPromise();
          } else {
            await timer(100).toPromise();
          }
          for (let i = 0, iL = images.length; i < iL; i++) {
            const image = images[i];
            let previousResult = imagesDetectResults[image.id];

            if (!!previousResult) {
              continue;
            }

            const overlay = imagesOverlayRef[image.id].current;
            const result = await from(
              detectAllFaces(image, FaceDetectOptions({ inputSize: 608 }))
            )
              .pipe(
                timeout(2000),
                catchError(() => of([]))
              )
              .toPromise();
            if (overlay) {
              drawDetections(result, overlay, overlay.width, overlay.height);
              observer.next(detectedImageFaces({ image, result }));
            }
            await timer(100).toPromise();
          }
          // console.log(`${new Date().toLocaleTimeString('enGb')} end`);
        }
      })
    )
  );
