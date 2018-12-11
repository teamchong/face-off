import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { concat, filter, switchMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { detectedVideoFaces, refreshFaces, RootActions } from '../actions';
import { compareFaces, generatePreview, uniqueId } from '../classes/faceApi';
import { FaceDetectResults, RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(detectedVideoFaces)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    switchMap(({ payload: { url, time, canvas, results } }) =>
      Observable.create(async observer => {
        const state = state$.value.faceOffPanel;
        const { faces } = state;

        for (const result of results) {
          const newFaces: FaceDetectResults = { ...faces };
          let foundId = '';

          for (const id in faces) {
            const face = newFaces[id];

            if (compareFaces(face.descriptor, result.descriptor)) {
              const newFace = {
                preview: face.preview,
                video: face.video,
                webcam: face.webcam,
                imageIds: face.imageIds,
                descriptor: face.descriptor,
              };

              if (!newFace.video[url]) {
                newFace.video[url] = new Set<number>([time]);
              } else {
                newFace.video[url].add(time);
              }
              newFaces[id] = newFace;
              foundId = id;
              break;
            }
            if (foundId) break;
          }

          if (!foundId) {
            newFaces[uniqueId()] = {
              preview: await generatePreview(canvas, result.detection),
              video: { [url]: new Set<number>([time]) },
              webcam: new Set<number>(),
              imageIds: new Set<string>(),
              descriptor: result.descriptor,
            };
          }
          observer.next(refreshFaces(newFaces));
          await new Promise(r => setTimeout(r, 0));
        }
        observer.complete();
      })
    )
  );
