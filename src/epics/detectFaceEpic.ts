import { StateObservable } from 'redux-observable';
import { concat, from, Observable, of } from 'rxjs';
import {
  catchError,
  concat,
  delay,
  expand,
  filter,
  first,
  map,
  switchMap,
  tap,
  timeout,
  timer,
} from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';
import {
  detectedImageFaces,
  detectedVideoFaces,
  detectedWebcamFaces,
  detectFaces,
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
          map(({ tab, videoCtx, videoOverlayRef, videoRef }) => ({
            overlay: videoOverlayRef.current,
            tab,
            videoCtx,
            video: videoRef.videoRef,
          })),
          filter(
            ({ tab, video }) => tab === 'one' && video && video.videoWidth
          ),
          switchMap(({ overlay, videoCtx, video }) => {
            const { videoWidth, videoHeight } = video;
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
              concat(results => {
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
        ),
        of(state$.value.faceOffPanel).pipe(
          map(({ tab, videoCtx, webcamOverlayRef, webcamRef }) => ({
            overlay: webcamOverlayRef.current,
            tab,
            videoCtx,
            video: (webcamRef.current || ({} as any)).video,
          })),
          filter(
            ({ tab, video }) => tab === 'two' && video && video.videoWidth
          ),
          switchMap(({ overlay, videoCtx, video }) => {
            const { videoWidth, videoHeight } = video;
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
              concat(results => {
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
        ),
        of(state$.value.faceOffPanel).pipe(
          switchMap(({ images, imagesDetectResults }) =>
            of(
              images.map((image, i) => ({
                id: image.id,
                image,
                i,
                results: imagesDetectResults[image.id],
              }))
            )
          ),
          filter(({ results }) => !!results),
          switchMap(({ id, image, i, results }) =>
            from(
              detectAllFaces(image, FaceDetectOptions({ inputSize: 608 }))
            ).pipe(
              map(result => detectedImageFaces({ image, result })),
              timeout(2000),
              catchError(() => detectedImageFaces({ image, result: [] })),
              delay(100)
            )
          )
        ),
        tap(() => console.log('detectFaces'))
      )
    )
  );
