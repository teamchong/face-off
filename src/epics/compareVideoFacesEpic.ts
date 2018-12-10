import { StateObservable } from 'redux-observable';
import { Observable, timer } from 'rxjs';
import { concat, filter, switchMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  detectedImageFaces,
  detectedVideoFaces,
  detectedWebcamFaces,
  refreshFaces,
  RootActions,
} from '../actions';
import {
  compareFaces,
  drawDetections,
  drawVideo,
  generatePreview,
  startDetectFaces,
  uniqueId,
} from '../classes/faceApi';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(detectedVideoFaces)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    switchMap(({ payload: { url, time, results } }) =>
      Observable.create(async observer => {
        const state = state$.value.faceOffPanel;
        const { faces, videoCtx } = state;
        const newFaces = { ...faces };
        await Promise.all(
          results.map(async result => {
            let foundId = '';

            for (const id in faces) {
              const face = newFaces[id];

              if (compareFaces(face.descriptor, result.descriptor)) {
                const newFace = {
                  preview: await generatePreview(
                    videoCtx.canvas,
                    result.detection
                  ),
                  video: face.video ? { ...face.video } : {},
                  webcam: face.webcam,
                  images: face.images,
                  descriptor: result.descriptor,
                };

                if (!newFace.video[url]) {
                  newFace.video[url] = [time];
                } else {
                  newFace.video[url] = [...face.video[url], time];
                }
                newFaces[id] = newFace;
                foundId = id;
                break;
              }
              if (foundId) break;
            }

            if (!foundId) {
              newFaces[uniqueId()] = {
                preview: await generatePreview(
                  videoCtx.canvas,
                  result.detection
                ),
                video: { [url]: [time] },
                webcam: [],
                images: {},
                descriptor: result.descriptor,
              };
            }
          })
        );
        observer.next(refreshFaces(newFaces));
        observer.complete();
      })
    )
  );
