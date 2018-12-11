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
  OPEN_IMAGEDETAILS,
  FACINGMODE_REAR,
  DEFAULT_VIDEO_URL,
} from './constants';
import { drawDetections, uniqueId } from './classes/faceApi';
import { revokeIfNeed } from './classes/fileApi';
import pasteHandlerEpic from './epics/pasteHandlerEpic';
import screenshotEpic from './epics/screenshotEpic';
import startAppEpic from './epics/startAppEpic';
import detectVideoFacesEpic from './epics/detectVideoFacesEpic';
import addImagesEpic from './epics/addImagesEpic';
import fetchMp4Epic from './epics/fetchMp4Epic';
import compareVideoFacesEpic from './epics/compareVideoFacesEpic';
import compareWebcamFacesEpic from './epics/compareWebcamFacesEpic';
import compareImageFacesEpic from './epics/compareImageFacesEpic';

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
  videoRef: createRef<HTMLVideoElement>(),
  webcamRef: createRef<Webcam>(),
  images: [],
  videoOverlayRef: createRef<HTMLCanvasElement>(),
  webcamOverlayRef: createRef<HTMLCanvasElement>(),
  imagesOverlaies: {},
  imagesDetectResults: {},
  faces: {},
  openImageId: '',
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
        for (const id in state.faces) {
          revokeIfNeed(state.faces[id].preview);
        }
        for (const id in state.imagesOverlaies) {
          revokeIfNeed(state.imagesOverlaies[id]);
        }
        return {
          ...state,
          mp4Url: '',
          images: [],
          imagesDetectResults: {},
          imagesOverlaies: {},
          isAppRunning: false,
        };
      }
      case DETECTED_IMAGEFACES: {
        const {
          payload: {
            image: { id },
            overlay,
            results,
          },
        } = action;
        return {
          ...state,
          imagesOverlaies: Object.assign({}, state.imagesOverlaies, {
            [id]: overlay,
          }),
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
