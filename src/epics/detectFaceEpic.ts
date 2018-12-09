import { StateObservable } from 'redux-observable';
import { from, Observable, of, timer } from 'rxjs';
import {
  catchError,
  concat,
  delay,
  filter,
  first,
  map,
  mapTo,
  switchMap,
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
            observer.next(detectedVideoFaces(result));

            drawDetections(
              result,
              videoOverlay,
              videoCtx.canvas.width,
              videoCtx.canvas.height
            );

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
            observer.next(detectedWebcamFaces(result));

            drawDetections(
              result,
              webcamOverlay,
              videoCtx.canvas.width,
              videoCtx.canvas.height
            );

            await timer(100).toPromise();
          } else {
            await timer(100).toPromise();
          }
          for (let i = 0, iL = images.length; i < iL; i++) {
            const image = images[i];
            let result = imagesDetectResults[image.id];
            const overlay = imagesOverlayRef[image.id].current;

            if (!result) {
              result = await from(
                detectAllFaces(image, FaceDetectOptions({ inputSize: 608 }))
              )
                .pipe(
                  timeout(2000),
                  catchError(() => of([]))
                )
                .toPromise();
              observer.next(detectedImageFaces({ image, result }));
              await timer(100).toPromise();
            }

            const canvasId = `${image.id}x`;

            if (overlay && overlay.id != canvasId) {
              drawDetections(result, overlay, overlay.width, overlay.height);
              overlay.id = canvasId;
            }
          }
          // console.log(`${new Date().toLocaleTimeString('enGb')} end`);
        }
      })
    )
  );
