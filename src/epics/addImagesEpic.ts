import { canvasToBlob, createObjectURL } from 'blob-util';
import { StateObservable } from 'redux-observable';
import { Observable, timer } from 'rxjs';
import { concat, filter, switchMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  addImages,
  detectedImageFaces,
  refreshFaces,
  RootActions,
} from '../actions';
import {
  startDetectFaces,
  drawDetections,
  generatePreview,
  uniqueId,
} from '../classes/faceApi';
import { RootState } from '../models';

export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isActionOf(addImages)),
    switchMap(({ payload: images }) =>
      Observable.create(async observer => {
        const { images } = state$.value.faceOffPanel;

        while (!state$.value.faceOffPanel.isModelsLoaded) {
          await new Promise(r => setTimeout(r, 100));
        }

        for (let i = 0, iL = images.length; i < iL; i++) {
          const image = images[i];

          const results = await startDetectFaces(image, 608);

          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          drawDetections(
            results.map(r => r.detection),
            canvas,
            canvas.width,
            canvas.height
          );
          const overlay = createObjectURL(await canvasToBlob(canvas));

          observer.next(
            detectedImageFaces({
              image,
              overlay,
              results: await results,
            })
          );
        }
      })
    )
  );
