import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { concat, concatMap, filter, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { compareWebcamFaces, refreshFaces, RootActions } from '../actions';
import { compareFaces, generatePreview, uniqueId } from '../classes/faceApi';
import { IFaceDetectResults, IRootState } from '../models';

export default (action$: Observable<RootActions>, state$: StateObservable<IRootState>): Observable<RootActions> =>
  action$.pipe(
    filter(isActionOf(compareWebcamFaces)),
    filter(() => state$.value.faceOffPanel.isAppRunning),
    concatMap(({ payload: { time, canvas, getDescriptor } }) =>
      Observable.create(async observer => {
        const { faces } = state$.value.faceOffPanel;
        try {
          const results = await getDescriptor();

          for (const result of results) {
            const newFaces: IFaceDetectResults = { ...faces };
            let foundId = '';

            // tslint:disable-next-line:forin
            for (const id in faces) {
              const face = newFaces[id];

              if (compareFaces(face.descriptor, result.descriptor)) {
                const newFace = {
                  descriptor: face.descriptor,
                  imageIds: face.imageIds,
                  preview: face.preview,
                  video: face.video,
                  webcam: new Set<number>(face.webcam).add(time),
                };
                newFaces[id] = newFace;
                foundId = id;
                break;
              }
              if (foundId) {
                break;
              }
            }

            if (!foundId) {
              newFaces[uniqueId()] = {
                descriptor: result.descriptor,
                imageIds: new Set<string>(),
                preview: await generatePreview(canvas, result.detection),
                video: {},
                webcam: new Set<number>([time]),
              };
            }
            observer.next(refreshFaces(newFaces));
            await new Promise(r => setTimeout(r, 100));
          }
        } catch (ex) {
          // tslint:disable-next-line:no-console
          console.warn(ex);
        }
        observer.complete();
      })
    )
  );
