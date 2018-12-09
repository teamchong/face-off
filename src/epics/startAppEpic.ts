import { from, Observable, of } from 'rxjs';
import {
  combineAll,
  concat,
  filter,
  mapTo,
  merge,
  switchMap,
} from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';
import {
  detectFaces,
  fetchMp4Url,
  loadedModels,
  RootActions,
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
    filter(isOfType(START_APP)),
    switchMap(() =>
      of(fetchMp4Url(DEFAULT_VIDEO_URL)).pipe(
        merge(
          from(FaceDetectModel(MODEL_URL)).pipe(
            merge(from(loadFaceLandmarkModel(MODEL_URL))),
            // merge(from((loadFaceLandmarkTinyModel(MODEL_URL)))),
            merge(from(loadFaceRecognitionModel(MODEL_URL))),
            combineAll(() => of(loadedModels()).pipe(concat(of(detectFaces()))))
          )
        )
      )
    )
  );
