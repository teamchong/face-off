import * as Dropzone from 'react-dropzone';
import { createAction } from 'typesafe-actions';
import {
  SWITCH_TAB,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES,
  SWITCH_FACINGMODE,
  CHANGE_VIDEOURL,
  FETCH_MP4URL,
  FETCHED_MP4URL,
  SCREENSHOT_VIDEO,
  START_APP,
  STOP_APP,
  LOADED_MODELS,
  DETECT_VIDEOFACES,
  DETECTED_VIDEOFACES,
  DETECTED_WEBCAMFACES,
  DETECTED_IMAGEFACES,
  LOADED_VIDEO,
  LOADED_WEBCAM,
  REFRESH_FACES,
  OPEN_IMAGEDETAILS,
} from '../constants';

export const switchTab = createAction(SWITCH_TAB, resolve => (tab: string) =>
  resolve(tab)
);
export const showMessage = createAction(
  SHOW_MESSAGE,
  resolve => (message: string) => resolve(message)
);
export const hideMessage = createAction(HIDE_MESSAGE, resolve => () =>
  resolve()
);

export const addImages = createAction(
  ADD_IMAGES,
  resolve => (images: HTMLImageElement[]) => resolve(images)
);
export const removeImages = createAction(
  REMOVE_IMAGES,
  resolve => (imageIndexes: number[]) => resolve(imageIndexes)
);

export const switchFacingMode = createAction(
  SWITCH_FACINGMODE,
  resolve => (facingMode: string) => resolve(facingMode)
);

export const changeVideoUrl = createAction(
  CHANGE_VIDEOURL,
  resolve => (videoUrl: string) => resolve(videoUrl)
);

export const fetchMp4Url = createAction(
  FETCH_MP4URL,
  resolve => (videoUrl: string) => resolve(videoUrl)
);

export const fetchedMp4Url = createAction(
  FETCHED_MP4URL,
  resolve => (payload: { videoUrlLoaded: string; mp4Url: string }) =>
    resolve(payload)
);

export const startApp = createAction(START_APP, resolve => () => resolve());
export const stopApp = createAction(STOP_APP, resolve => () => resolve());

export const screenshotVideo = createAction(
  SCREENSHOT_VIDEO,
  resolve => (payload: HTMLVideoElement) => resolve()
);

export const loadedModels = createAction(LOADED_MODELS, resolve => () =>
  resolve()
);

export const detectVideoFaces = createAction(DETECT_VIDEOFACES, resolve => () =>
  resolve()
);

export const detectedVideoFaces = createAction(
  DETECTED_VIDEOFACES,
  resolve => (payload: {
    url: string;
    time: number;
    canvas: HTMLCanvasElement;
    results: any[];
  }) => resolve(payload)
);

export const detectedWebcamFaces = createAction(
  DETECTED_WEBCAMFACES,
  resolve => (payload: {
    time: number;
    canvas: HTMLCanvasElement;
    results: any[];
  }) => resolve(payload)
);

export const detectedImageFaces = createAction(
  DETECTED_IMAGEFACES,
  resolve => (payload: {
    image: HTMLImageElement;
    overlay: string;
    results: any[];
  }) => resolve(payload)
);

export const refreshFaces = createAction(
  REFRESH_FACES,
  resolve => (payload: any) => resolve(payload)
);

export const loadedVideo = createAction(LOADED_VIDEO, resolve => () =>
  resolve()
);

export const loadedWebcam = createAction(LOADED_WEBCAM, resolve => () =>
  resolve()
);

export const openImageDetails = createAction(
  OPEN_IMAGEDETAILS,
  resolve => (payload: string) => resolve(payload)
);
