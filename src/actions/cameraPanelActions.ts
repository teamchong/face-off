import * as Dropzone from 'react-dropzone';
import { action } from 'typesafe-actions';
import {
  SWITCHTAB_CAMERAPANEL,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES,
  SWITCH_FACINGMODE,
  CHANGE_YOUTUBEURL,
  FETCH_MP4URL,
  FETCHED_MP4URL,
  APP_START,
  APP_STOP,
  LOADED_MODELS,
  DETECT_FACES,
} from '../constants';

export const switchTab = (tab: string) => action(SWITCHTAB_CAMERAPANEL, tab);
export const showMessage = (message: string) => action(SHOW_MESSAGE, message);
export const hideMessage = () => action(HIDE_MESSAGE);

export const addImages = (images: HTMLImageElement[]) =>
  action(ADD_IMAGES, images);
export const removeImages = (imageIndexes: number[]) =>
  action(REMOVE_IMAGES, imageIndexes);

export const switchFacingMode = (facingMode: string) =>
  action(SWITCH_FACINGMODE, facingMode);

export const changeYoutubeUrl = (youtubeUrl: string) =>
  action(CHANGE_YOUTUBEURL, youtubeUrl);

export const fetchMp4Url = (youtubeUrl: string) =>
  action(FETCH_MP4URL, youtubeUrl);

export const fetchedMp4Url = (payload: {
  youtubeUrlLoaded: string;
  mp4Url: string;
}) => action(FETCHED_MP4URL, payload);

export const appStart = () => action(APP_START);
export const appStop = () => action(APP_STOP);

export const loadedModels = () => action(LOADED_MODELS);

export const detectFaces = () => action(DETECT_FACES);
