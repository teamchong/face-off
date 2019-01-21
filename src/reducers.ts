import { createRef } from 'react';
import * as Webcam from 'react-webcam';
import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { RootActions } from './actions';
import { drawDetections, uniqueId } from './classes/faceApi';
import { revokeIfNeed } from './classes/fileApi';
import {
  ADD_IMAGES,
  CHANGE_VIDEOURL,
  COMPARE_IMAGEFACES,
  COMPARE_VIDEOFACES,
  COMPARE_WEBCAMFACES,
  DEFAULT_VIDEO_URL,
  FACINGMODE_REAR,
  FETCH_MP4URL,
  FETCHED_MP4URL,
  HIDE_MESSAGE,
  LOADED_MODELS,
  LOADED_VIDEO,
  LOADED_WEBCAM,
  OPEN_IMAGEDETAILS,
  REFRESH_FACES,
  REMOVE_IMAGES,
  SCREENSHOT_VIDEO,
  SHOW_MESSAGE,
  START_APP,
  STOP_APP,
  SWITCH_FACINGMODE,
  SWITCH_TAB,
} from './constants';
import addImagesEpic from './epics/addImagesEpic';
import compareImageFacesEpic from './epics/compareImageFacesEpic';
import compareVideoFacesEpic from './epics/compareVideoFacesEpic';
import compareWebcamFacesEpic from './epics/compareWebcamFacesEpic';
import detectVideoFacesEpic from './epics/detectVideoFacesEpic';
import fetchMp4Epic from './epics/fetchMp4Epic';
import pasteHandlerEpic from './epics/pasteHandlerEpic';
import screenshotEpic from './epics/screenshotEpic';
import startAppEpic from './epics/startAppEpic';
import { IRootState } from './models';

export const rootEpic = combineEpics(
  pasteHandlerEpic,
  screenshotEpic,
  startAppEpic,
  detectVideoFacesEpic,
  addImagesEpic,
  fetchMp4Epic,
  compareVideoFacesEpic,
  compareWebcamFacesEpic,
  compareImageFacesEpic
);

const initState = {
  faces: {},
  facingMode: FACINGMODE_REAR,
  images: [],
  imagesDetectResults: {},
  imagesOverlaies: {},
  isAppRunning: false,
  isModelsLoaded: false,
  isVideoLoaded: false,
  isWebcamLoaded: false,
  message: '',
  mp4Url: '',
  openImageId: '',
  tab: 'one',
  videoOverlayRef: createRef<HTMLCanvasElement>(),
  videoRef: createRef<HTMLVideoElement>(),
  videoUrl: DEFAULT_VIDEO_URL,
  videoUrlLoaded: '',
  webcamOverlayRef: createRef<HTMLCanvasElement>(),
  webcamRef: createRef<Webcam>(),
};

export const rootReducer = combineReducers<IRootState, RootActions>({
  faceOffPanel(state = initState, action: RootActions) {
    switch (action.type) {
      case SWITCH_TAB: {
        const { payload: tab } = action;
        return { ...state, tab };
      }
      case SHOW_MESSAGE: {
        const { payload: message } = action;
        return { ...state, message };
      }
      case HIDE_MESSAGE: {
        return { ...state, message: null };
      }
      case ADD_IMAGES: {
        const { payload: images } = action;
        images.forEach(image => (image.id = uniqueId()));
        return {
          ...state,
          imageFaceDetctResults: {
            ...state.imagesDetectResults,
            ...images.reduce((result, image) => {
              result[image.id] = null;
              return result;
            }, {}),
          },
          images: [...state.images, ...images],
          imagesOverlaies: {
            ...state.imagesOverlaies,
            ...images.reduce((result, image) => {
              result[image.id] = '';
              return result;
            }, {}),
          },
        };
      }
      case REMOVE_IMAGES: {
        const { payload: imageIndexes } = action;
        const removeIds = new Set<string>();

        for (const imageIndex of imageIndexes) {
          const image = state.images[imageIndex];
          if (image) {
            removeIds.add(image.id);
            revokeIfNeed(image.src);
          }
        }

        const faces = {};
        // tslint:disable-next-line:forin
        for (const id in state.faces) {
          const imageIds = Array.from(state.faces[id].imageIds).filter(
            imageId => !removeIds.has(imageId)
          );

          if (imageIds.length !== state.faces[id].imageIds.size) {
            faces[id] = { ...state.faces[id], imageIds: new Set(imageIds) };
          } else {
            faces[id] = state.faces[id];
          }
        }

        return {
          ...state,
          faces,
          images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0),
        };
      }
      case SWITCH_FACINGMODE: {
        const { payload: facingMode } = action;
        return { ...state, facingMode };
      }
      case CHANGE_VIDEOURL: {
        const { payload: videoUrl } = action;
        return { ...state, videoUrl };
      }
      case FETCH_MP4URL: {
        const { payload: videoUrlBeforeTrim } = action;
        const { mp4Url: previousMp4Url } = state;
        const videoUrl = (videoUrlBeforeTrim || '').replace(/^\s+|\s+$/g, '');
        if (previousMp4Url !== videoUrl) {
          revokeIfNeed(previousMp4Url);
        }
        return { ...state, videoUrl, mp4Url: '', isVideoLoaded: false };
      }
      case FETCHED_MP4URL: {
        const {
          payload: { videoUrlLoaded, mp4Url },
        } = action;
        return { ...state, videoUrlLoaded, mp4Url, isVideoLoaded: false };
      }
      case LOADED_MODELS: {
        return { ...state, isModelsLoaded: true };
      }
      case START_APP: {
        return { ...state, isAppRunning: true };
      }
      case STOP_APP: {
        state.images.forEach(image => revokeIfNeed(image.src));
        revokeIfNeed(state.mp4Url);
        // tslint:disable-next-line:forin
        for (const id in state.faces) {
          revokeIfNeed(state.faces[id].preview);
        }
        // tslint:disable-next-line:forin
        for (const id in state.imagesOverlaies) {
          revokeIfNeed(state.imagesOverlaies[id]);
        }
        return {
          ...state,
          images: [],
          imagesDetectResults: {},
          imagesOverlaies: {},
          isAppRunning: false,
          mp4Url: '',
        };
      }
      case COMPARE_IMAGEFACES: {
        const {
          payload: {
            image: { id },
            overlay,
            results,
          },
        } = action;
        return {
          ...state,
          imagesDetectResults: Object.assign({}, state.imagesDetectResults, {
            [id]: results,
          }),
          imagesOverlaies: Object.assign({}, state.imagesOverlaies, {
            [id]: overlay,
          }),
        };
      }
      case REFRESH_FACES: {
        const { payload: faces } = action;
        // console.log(faces);
        return { ...state, faces };
      }
      case OPEN_IMAGEDETAILS: {
        const { payload: openImageId } = action;
        return { ...state, openImageId };
      }
      case LOADED_VIDEO: {
        return { ...state, isVideoLoaded: true };
      }
      case LOADED_WEBCAM: {
        return { ...state, isWebcamLoaded: true };
      }
      default: {
        return state;
      }
    }
  },
});
