import { StateObservable } from 'redux-observable';
import { from, Observable, of, timer } from 'rxjs';
import {
  catchError,
  concat,
  delay,
  filter,
  first,
  map,
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

// import {
//   detectAllFaces,
//   extractFaces,
//   SsdMobilenetv1Options,
// } from 'face-api.js';
// const FaceDetectOptions = (opts?: any) =>
//   new (SsdMobilenetv1Options as any)(opts);
import {
  detectAllFaces,
  extractFaces,
  TinyFaceDetectorOptions,
} from 'face-api.js';
const FaceDetectOptions = (opts?: any) =>
  new (TinyFaceDetectorOptions as any)(opts);

const drawVideo = (
  video: HTMLVideoElement,
  videoCtx: CanvasRenderingContext2D
) => {
  const { videoWidth, videoHeight } = video;
  videoCtx.canvas.width = videoWidth;
  videoCtx.canvas.height = videoHeight;
  videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
};
const detectFaces = async (
  canvas: HTMLCanvasElement | HTMLImageElement,
  inputSize: number
) => {
  return await from(
    detectAllFaces(canvas, FaceDetectOptions({ inputSize }))
      .withFaceLandmarks()
      .withFaceDescriptors()
  )
    .pipe(
      timeout(500),
      catchError(() => of([]))
    )
    .toPromise();
};

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isOfType(DETECT_FACES)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    switchMap(() =>
      Observable.create(async observer => {
        let state = state$.value.faceOffPanel;
        while (state.isAppRunning) {
          let {
            videoRef: { current: video },
          } = state$.value.faceOffPanel;
          const {
            tab,
            videoOverlayRef: { current: videoOverlay },
            webcamRef: { current: webcam },
            webcamOverlayRef: { current: webcamOverlay },
            videoCtx,
            images,
            imagesOverlayRef,
            imagesDetectResults,
            isModelsLoaded,
          } = state$.value.faceOffPanel;

          if (tab == 'one' && video && video.videoWidth) {
            drawVideo(video, videoCtx);

            if (isModelsLoaded) {
              const result = await detectFaces(videoCtx.canvas, 224);
              observer.next(detectedVideoFaces(result));

              const { width, height } = videoCtx.canvas;
              drawDetections(
                result.map(r => r.detection),
                videoOverlay,
                width,
                height
              );
            }
          } else if (tab === 'two' && webcam) {
            video = (webcam as any).video;

            if (video && video.videoWidth) {
              drawVideo(video, videoCtx);

              if (isModelsLoaded) {
                const result = await detectFaces(videoCtx.canvas, 224);
                observer.next(detectedWebcamFaces(result));

                const { width, height } = videoCtx.canvas;
                drawDetections(
                  result.map(r => r.detection),
                  webcamOverlay,
                  width,
                  height
                );
              }
            }
          }

          await timer(100).toPromise();

          if (isModelsLoaded) {
            for (let i = 0, iL = images.length; i < iL; i++) {
              const image = images[i];
              let result = imagesDetectResults[image.id];
              const overlay = imagesOverlayRef[image.id].current;

              if (!result) {
                result = await detectFaces(image, 608);
                observer.next(detectedImageFaces({ image, result }));
                await timer(100).toPromise();
              }

              const canvasId = `${image.id}x`;

              if (overlay && overlay.id != canvasId) {
                drawDetections(
                  result.map(r => r.detection),
                  overlay,
                  overlay.width,
                  overlay.height
                );
                overlay.id = canvasId;
              }
            }
          }
        }
      })
    )
  );
