import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { concat, exhaustMap, filter, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  compareVideoFaces,
  compareWebcamFaces,
  detectVideoFaces,
  RootActions,
} from '../actions';
import { drawDetections, drawVideo, scanImage } from '../classes/faceApi';
import { IRootState } from '../models';

export default (action$: Observable<RootActions>, state$: StateObservable<IRootState>): Observable<RootActions> =>
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

          if (tab === 'one' && video && video.videoWidth && isVideoLoaded) {
            const canvas = drawVideo(video);
            try {
              // tslint:disable-next-line:no-bitwise
              const time = ~~video.currentTime;

              if (isModelsLoaded) {
                const { detection, getDescriptor } = await scanImage(
                  canvas,
                  288,
                  500
                );
                const { width, height } = canvas;
                drawDetections(detection, videoOverlay, width, height);
                observer.next(
                  compareVideoFaces({
                    canvas,
                    getDescriptor,
                    time,
                    url: videoUrlLoaded,
                  })
                );
              }
            } catch (ex) {
              // tslint:disable-next-line:no-console
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
                    288,
                    500
                  );
                  const { width, height } = canvas;
                  drawDetections(detection, webcamOverlay, width, height);
                  observer.next(
                    compareWebcamFaces({
                      canvas,
                      getDescriptor,
                      // tslint:disable-next-line:no-bitwise
                      time: ~~(new Date().getTime() / 1000) * 1000,
                    })
                  );
                }
              } catch (ex) {
                // tslint:disable-next-line:no-console
                console.warn(ex);

                const { width, height } = canvas;
                drawDetections([], webcamOverlay, width, height);
              }
            }
          }
          await new Promise(r => setTimeout(r, 100));
        }
        observer.complete();
      })
    )
  );
