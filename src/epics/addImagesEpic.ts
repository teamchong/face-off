import { canvasToBlob, createObjectURL } from 'blob-util';
import { StateObservable } from 'redux-observable';
import { Observable, timer } from 'rxjs';
import { concat, filter, mergeMap, timeout } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  addImages,
  compareImageFaces,
  refreshFaces,
  RootActions,
} from '../actions';
import {
  scanImage,
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
    mergeMap(({ payload: images }) =>
      Observable.create(async observer => {
        while (!state$.value.faceOffPanel.isModelsLoaded) {
          await new Promise(r => setTimeout(r, 100));
        }

        await new Promise(r => setTimeout(r, 100));

        for (let i = 0, iL = images.length; i < iL; i++) {
          const image = images[i];

          const { detection, getDescriptor } = await scanImage(image, 288);

          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          drawDetections(detection, canvas, canvas.width, canvas.height);
          const overlay = createObjectURL(await canvasToBlob(canvas));

          observer.next(
            compareImageFaces({
              image,
              overlay,
              getDescriptor,
            })
          );
        }
        observer.complete();
      })
    )
  );
