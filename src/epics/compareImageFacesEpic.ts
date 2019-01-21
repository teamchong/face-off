import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { concat, concatMap, filter, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { compareImageFaces, refreshFaces, RootActions } from '../actions';
import { compareFaces, generatePreview, uniqueId } from '../classes/faceApi';
import { IFaceDetectResults, IRootState } from '../models';

export default (action$: Observable<RootActions>, state$: StateObservable<IRootState>): Observable<RootActions> =>
  action$.pipe(
    filter(isActionOf(compareImageFaces)),
    concatMap(({ payload: { image, getDescriptor } }) =>
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
                  imageIds: face.imageIds.add(image.id),
                  preview: face.preview,
                  video: face.video,
                  webcam: face.webcam,
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
              // const canvas = document.createElement('canvas');
              // canvas.width = image.width;
              // canvas.height = image.height;
              // canvas.getContext('2d').drawImage(image, 0, 0);
              newFaces[uniqueId()] = {
                descriptor: result.descriptor,
                imageIds: new Set<string>([image.id]),
                // preview: await generatePreview(canvas, result.detection),
                preview: await generatePreview(image, result.detection),
                video: {},
                webcam: new Set<number>(),
              };
            }
            observer.next(refreshFaces(newFaces));
            await new Promise(r => setTimeout(r, 0));
          }
        } catch (ex) {
          // tslint:disable-next-line:no-console
          console.warn(ex);
        }
        observer.complete();
      })
    )
  );
