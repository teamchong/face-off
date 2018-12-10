import { forkJoin, from, Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  detectFaces,
  fetchMp4Url,
  loadedModels,
  RootActions,
  startApp,
} from '../actions';
import { DEFAULT_VIDEO_URL, MODEL_URL, START_APP } from '../constants';

// import { loadSsdMobilenetv1Model } from 'face-api.js';
// const FaceDetectModel = loadSsdMobilenetv1Model;
import {
  loadTinyFaceDetectorModel,
  loadFaceLandmarkModel,
  // loadFaceLandmarkTinyModel,
  loadFaceRecognitionModel,
} from 'face-api.js';
const FaceDetectModel = loadTinyFaceDetectorModel;

export default (action$: Observable<RootActions>) =>
  action$.pipe(
    filter(isActionOf(startApp)),
    switchMap(() =>
      Observable.create(async observer => {
        observer.next(fetchMp4Url(DEFAULT_VIDEO_URL));
        await FaceDetectModel(MODEL_URL);
        await loadFaceLandmarkModel(MODEL_URL);
        // await loadFaceLandmarkTinyModel(MODEL_URL);
        await loadFaceRecognitionModel(MODEL_URL);
        observer.next(loadedModels());
        observer.next(detectFaces());
        observer.complete();
      })
    )
  );
