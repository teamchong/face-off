import { from, merge, Observable } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';
import { fetchMp4Url, loadedModels, RootActions } from '../actions';
import { DEFAULT_VIDEO_URL, START_APP } from '../constants';

// import { loadSsdMobilenetv1Model } from 'face-api.js';
import { loadTinyFaceDetectorModel } from 'face-api.js';
const FaceDetectModel = loadTinyFaceDetectorModel;

export default (action$: Observable<RootActions>) =>
  action$.pipe(
    filter(isOfType(START_APP)),
    mapTo(
      merge(
        fetchMp4Url(DEFAULT_VIDEO_URL),
        from(
          FaceDetectModel(
            'https://justadudewhohacks.github.io/face-api.js/models/'
          )
        ).pipe(mapTo(loadedModels()))
      )
    )
  );
