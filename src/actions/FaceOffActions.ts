import * as Dropzone from 'react-dropzone';
import { action } from 'typesafe-actions';
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
  DETECT_FACES,
  DETECTED_VIDEOFACES,
  DETECTED_WEBCAMFACES,
  DETECTED_IMAGEFACES,
  LOADED_VIDEO,
  LOADED_WEBCAM,
} from '../constants';

export const switchTab = (tab: string) => action(SWITCH_TAB, tab);
export const showMessage = (message: string) => action(SHOW_MESSAGE, message);
export const hideMessage = () => action(HIDE_MESSAGE);

export const addImages = (images: HTMLImageElement[]) =>
  action(ADD_IMAGES, images);
export const removeImages = (imageIndexes: number[]) =>
  action(REMOVE_IMAGES, imageIndexes);

export const switchFacingMode = (facingMode: string) =>
  action(SWITCH_FACINGMODE, facingMode);

export const changeVideoUrl = (videoUrl: string) =>
  action(CHANGE_VIDEOURL, videoUrl);

export const fetchMp4Url = (videoUrl: string) => action(FETCH_MP4URL, videoUrl);

export const fetchedMp4Url = (payload: {
  videoUrlLoaded: string;
  mp4Url: string;
}) => action(FETCHED_MP4URL, payload);

export const startApp = () => action(START_APP);
export const stopApp = () => action(STOP_APP);

export const screenshotVideo = () => action(SCREENSHOT_VIDEO);

export const loadedModels = () => action(LOADED_MODELS);

export const detectFaces = () => action(DETECT_FACES);

export const detectedVideoFaces = (payload: {
  url: string;
  time: number;
  results: any[];
}) => action(DETECTED_VIDEOFACES, payload);

export const detectedWebcamFaces = (payload: {
  time: number;
  results: any[];
}) => action(DETECTED_WEBCAMFACES, payload);

export const detectedImageFaces = (payload: {
  image: HTMLImageElement;
  results: any[];
}) => action(DETECTED_IMAGEFACES, payload);

export const refreshFaces = (payload: any) => action(REFRESH_FACES, playload);

export const loadedVideo = () => action(LOADED_VIDEO);

export const loadedWebcam = () => action(LOADED_WEBCAM);
