import { StateObservable } from 'redux-observable';
import { Observable, timer } from 'rxjs';
import { concat, filter, switchMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { detectedWebcamFaces, refreshFaces, RootActions } from '../actions';
import { compareFaces, generatePreview, uniqueId } from '../classes/faceApi';
import { FaceDetectResults, RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(detectedWebcamFaces)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    switchMap(({ payload: { time, canvas, results } }) =>
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
                webcam: new Set<number>(face.webcam).add(time),
                imageIds: face.imageIds,
                descriptor: face.descriptor,
              };
              newFaces[id] = newFace;
              foundId = id;
              break;
            }
            if (foundId) break;
          }

          if (!foundId) {
            newFaces[uniqueId()] = {
              preview: await generatePreview(canvas, result.detection),
              video: {},
              webcam: new Set<number>([time]),
              imageIds: new Set<string>(),
              descriptor: result.descriptor,
            };
          }
          observer.next(refreshFaces(newFaces));
          await timer(0).toPromise();
        }
        observer.complete();
      })
    )
  );
