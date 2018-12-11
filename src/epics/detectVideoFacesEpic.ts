import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { concat, filter, exhaustMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  detectVideoFaces,
  detectedImageFaces,
  detectedVideoFaces,
  detectedWebcamFaces,
  RootActions,
} from '../actions';
import { scanImage, drawDetections, drawVideo } from '../classes/faceApi';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(detectVideoFaces)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    exhaustMap(() =>
      Observable.create(async observer => {
        while (state$.value.faceOffPanel.isAppRunning) {
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
            try {
              const time = ~~video.currentTime;

              if (isModelsLoaded) {
                const { detection, getDescriptor } = await scanImage(
                  canvas,
                  160,
                  500
                );
                const { width, height } = canvas;
                drawDetections(detection, videoOverlay, width, height);
                observer.next(
                  detectedVideoFaces({
                    url: videoUrlLoaded,
                    time,
                    canvas,
                    getDescriptor,
                  })
                );
              }
            } catch (ex) {
              console.warn(ex);

              const { width, height } = canvas;
              drawDetections([], videoOverlay, width, height);
            }
          } else if (tab === 'two' && webcam && isWebcamLoaded) {
            video = (webcam as any).video;

            if (video && video.videoWidth) {
              const canvas = drawVideo(video);
              try {
                if (isModelsLoaded) {
                  const { detection, getDescriptor } = await scanImage(
                    canvas,
                    160,
                    500
                  );
                  const { width, height } = canvas;
                  drawDetections(detection, webcamOverlay, width, height);
                  observer.next(
                    detectedWebcamFaces({
                      time: new Date().getTime(),
                      canvas,
                      getDescriptor,
                    })
                  );
                }
              } catch (ex) {
                console.warn(ex);

                const { width, height } = canvas;
                drawDetections([], webcamOverlay, width, height);
              }
            }
          }

          await new Promise(r => setTimeout(r, 0));
        }
        observer.complete();
      })
    )
  );
