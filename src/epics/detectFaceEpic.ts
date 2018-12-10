import { StateObservable } from 'redux-observable';
import { Observable, timer } from 'rxjs';
import { concat, filter, switchMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  detectFaces,
  detectedImageFaces,
  detectedVideoFaces,
  detectedWebcamFaces,
  RootActions,
} from '../actions';
import {
  startDetectFaces,
  drawDetections,
  drawVideo,
} from '../classes/faceApi';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(detectFaces)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    switchMap(() =>
      Observable.create(async observer => {
        const state = state$.value.faceOffPanel;
        while (state.isAppRunning) {
          let {
            videoRef: { current: video },
          } = state$.value.faceOffPanel;
          const {
            tab,
            videoOverlayRef: { current: videoOverlay },
            webcamRef: { current: webcam },
            webcamOverlayRef: { current: webcamOverlay },
            videoUrlLoaded,
            videoCtx,
            images,
            imagesOverlayRef,
            imagesDetectResults,
            isModelsLoaded,
          } = state$.value.faceOffPanel;

          if (tab == 'one' && video && video.videoWidth) {
            drawVideo(video, videoCtx);
            const time = ~~video.currentTime;

            if (isModelsLoaded) {
              const results = await startDetectFaces(videoCtx.canvas, 320);
              observer.next(
                detectedVideoFaces({ url: videoUrlLoaded, time, results })
              );

              const { width, height } = videoCtx.canvas;
              drawDetections(
                results.map(r => r.detection),
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
                const results = await startDetectFaces(videoCtx.canvas, 320);
                observer.next(
                  detectedWebcamFaces({ time: new Date().getTime(), results })
                );

                const { width, height } = videoCtx.canvas;
                drawDetections(
                  results.map(r => r.detection),
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
              let results = imagesDetectResults[image.id];
              const overlay = imagesOverlayRef[image.id].current;

              if (!results) {
                results = await startDetectFaces(image, 608);
                observer.next(
                  detectedImageFaces({
                    image,
                    results: await results,
                  })
                );
                await timer(100).toPromise();
              }

              const canvasId = `${image.id}x`;

              if (overlay && overlay.id != canvasId) {
                drawDetections(
                  results.map(r => r.detection),
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
