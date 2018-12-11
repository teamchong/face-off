import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { concat, filter, switchMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  detectVideoFaces,
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
    filter(isActionOf(detectVideoFaces)),
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
            isModelsLoaded,
            isVideoLoaded,
            isWebcamLoaded,
          } = state$.value.faceOffPanel;

          if (tab == 'one' && video && video.videoWidth && isVideoLoaded) {
            const canvas = drawVideo(video);
            const time = ~~video.currentTime;

            if (isModelsLoaded) {
              const results = await startDetectFaces(canvas, 320);
              observer.next(
                detectedVideoFaces({
                  url: videoUrlLoaded,
                  time,
                  canvas,
                  results,
                })
              );

              const { width, height } = canvas;
              drawDetections(
                results.map(r => r.detection),
                videoOverlay,
                width,
                height
              );
            }
          } else if (tab === 'two' && webcam && isWebcamLoaded) {
            video = (webcam as any).video;

            if (video && video.videoWidth) {
              const canvas = drawVideo(video);

              if (isModelsLoaded) {
                const results = await startDetectFaces(canvas, 320);
                observer.next(
                  detectedWebcamFaces({
                    time: new Date().getTime(),
                    canvas,
                    results,
                  })
                );

                const { width, height } = canvas;
                drawDetections(
                  results.map(r => r.detection),
                  webcamOverlay,
                  width,
                  height
                );
              }
            }
          }

          await new Promise(r => setTimeout(r, 100));
        }
      })
    )
  );
