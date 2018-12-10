import { revokeObjectURL } from 'blob-util';
import { createRef } from 'react';
import * as Webcam from 'react-webcam';
import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { RootState } from './models';
import { RootActions } from './actions';
import {
  SWITCH_TAB,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES,
  SWITCH_FACINGMODE,
  CHANGE_VIDEOURL,
  LOADED_VIDEO,
  LOADED_WEBCAM,
  FETCH_MP4URL,
  FETCHED_MP4URL,
  SCREENSHOT_VIDEO,
  START_APP,
  STOP_APP,
  LOADED_MODELS,
  DETECTED_VIDEOFACES,
  DETECTED_WEBCAMFACES,
  DETECTED_IMAGEFACES,
  REFRESH_FACES,
  FACINGMODE_REAR,
  DEFAULT_VIDEO_URL,
} from './constants';
import { drawDetections, uniqueId } from './classes/faceApi';
import { revokeIfNeed } from './classes/fileApi';
import pasteHandlerEpic from './epics/pasteHandlerEpic';
import screenshotEpic from './epics/screenshotEpic';
import startAppEpic from './epics/startAppEpic';
import detectFaceEpic from './epics/detectFaceEpic';
import fetchMp4Epic from './epics/fetchMp4Epic';
import compareVideoFacesEpic from './epics/compareVideoFacesEpic';

export const rootEpic = combineEpics(
  pasteHandlerEpic,
  screenshotEpic,
  startAppEpic,
  detectFaceEpic,
  fetchMp4Epic,
  compareVideoFacesEpic
);

const initState = {
  isAppRunning: false,
  isModelsLoaded: false,
  isVideoLoaded: false,
  isWebcamLoaded: false,
  tab: 'one',
  message: '',
  facingMode: FACINGMODE_REAR,
  videoUrl: DEFAULT_VIDEO_URL,
  videoUrlLoaded: '',
  mp4Url: '',
  videoCtx: document.createElement('canvas').getContext('2d'),
  videoRef: createRef<HTMLVideoElement>(),
  webcamRef: createRef<Webcam>(),
  images: [],
  videoOverlayRef: createRef<HTMLCanvasElement>(),
  webcamOverlayRef: createRef<HTMLCanvasElement>(),
  imagesOverlayRef: {},
  imagesDetectResults: {},
  faces: {},
};

export const rootReducer = combineReducers<RootState, RootActions>({
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
          images: [...state.images, ...images],
          imageFaceDetctResults: {
            ...state.imagesDetectResults,
            ...images.reduce((result, image) => {
              result[image.id] = null;
              return result;
            }, {}),
          },
          imagesOverlayRef: {
            ...state.imagesOverlayRef,
            ...images.reduce((result, image) => {
              result[image.id] = createRef<HTMLCanvasElement>();
              return result;
            }, {}),
          },
        };
      }
      case REMOVE_IMAGES: {
        const { payload: imageIndexes } = action;
        for (const imageIndex of imageIndexes) {
          revokeIfNeed(state.images[imageIndex].src);
        }
        const imageIds = state.images
          .filter((image, i) => imageIndexes.indexOf(i) < 0)
          .map(image => image.id);
        for (const id in state.faces) {
          revokeIfNeed(state.faces[id].preview);
        }
        return {
          ...state,
          images: state.images.filter((img, i) => imageIndexes.indexOf(i) < 0),
          imagesDetectResults: imageIds.reduce((result, imageId) => {
            result[imageId] = state.imagesDetectResults[imageId];
            return result;
          }, {}),
          imagesOverlayRef: imageIds.reduce((result, imageId) => {
            result[imageId] = state.imagesOverlayRef[imageId];
            return result;
          }, {}),
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
        return {
          ...state,
          mp4Url: '',
          images: [],
          imagesDetectResults: [],
          isAppRunning: false,
        };
      }
      case DETECTED_IMAGEFACES: {
        const {
          payload: {
            image: { id },
            results,
          },
        } = action;
        return {
          ...state,
          imagesDetectResults: Object.assign({}, state.imagesDetectResults, {
            [id]: results,
          }),
        };
      }
      case REFRESH_FACES: {
        const { payload: faces } = action;
        // console.log(faces);
        return { ...state, faces };
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
