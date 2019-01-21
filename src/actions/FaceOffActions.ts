import * as Dropzone from 'react-dropzone';
import { createAction } from 'typesafe-actions';
import {
  ADD_IMAGES,
  CHANGE_VIDEOURL,
  COMPARE_IMAGEFACES,
  COMPARE_VIDEOFACES,
  COMPARE_WEBCAMFACES,
  DETECT_VIDEOFACES,
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
  resolve => (payload: HTMLVideoElement) => resolve(payload)
);

export const loadedModels = createAction(LOADED_MODELS, resolve => () =>
  resolve()
);

export const detectVideoFaces = createAction(DETECT_VIDEOFACES, resolve => () =>
  resolve()
);

export const compareVideoFaces = createAction(
  COMPARE_VIDEOFACES,
  resolve => (payload: {
    url: string;
    time: number;
    canvas: HTMLCanvasElement;
    getDescriptor: () => Promise<any[]>;
  }) => resolve(payload)
);

export const compareWebcamFaces = createAction(
  COMPARE_WEBCAMFACES,
  resolve => (payload: {
    time: number;
    canvas: HTMLCanvasElement;
    getDescriptor: () => Promise<any[]>;
  }) => resolve(payload)
);

export const compareImageFaces = createAction(
  COMPARE_IMAGEFACES,
  resolve => (payload: {
    image: HTMLImageElement;
    overlay: string;
    getDescriptor: () => Promise<any[]>;
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
