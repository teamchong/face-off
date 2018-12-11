import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { concat, filter, concatMap, timeout } from 'rxjs/operators';
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
    concatMap(({ payload: { url, time, canvas, getDescriptor } }) =>
      Observable.create(async observer => {
        const { faces } = state$.value.faceOffPanel;
        const results = await getDescriptor();

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
          await new Promise(r => setTimeout(r, 100));
        }
        observer.complete();
      })
    )
  );
