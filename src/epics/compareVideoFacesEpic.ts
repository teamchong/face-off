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
  startDetectFaces,
  drawDetections,
  drawVideo,
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
    switchMap(({ playload: { url, time, results } }) =>
      Observable.create(async observer => {
        const state = state$.value.faceOffPanel;
        const { faces } = state;
        const newFaces = { ...faces };
        for (const result of results) {
          await new Promise(resolve => {
            let foundId = '';

            for (const id in faces) {
              const face = newFaces[id];

              if (compareFaces(face.descriptor, result.descriptor)) {
                const newFace = {
                  video: face.video ? { ...face.video } : {},
                  webcam: face.webcam,
                  images: face.images,
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
                video: { [url]: [time] },
                webcam: [],
                images: {},
              };
            }
          });
          await timer(300).toPromise();
        }
        observer.next(refreshFaces(newFaces));
      })
    )
  );
