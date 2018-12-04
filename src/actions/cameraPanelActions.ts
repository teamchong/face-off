import * as Dropzone from 'react-dropzone';
import { action } from 'typesafe-actions';
import {
  SWITCHTAB_CAMPANEL,
  SHOW_MESSAGE,
  HIDE_MESSAGE,
  ADD_IMAGES,
  REMOVE_IMAGES
} from '../constants';

export const switchTab = (tab: string) => action(SWITCHTAB_CAMPANEL, tab);
export const showMessage = (message: string) => action(SHOW_MESSAGE, message);
export const hideMessage = () => action(HIDE_MESSAGE);

export const addImages = (images: Dropzone.ImageFile[]) =>
  action(ADD_IMAGES, images);
export const removeImages = (imageIndexes: number[]) =>
  action(REMOVE_IMAGES, imageIndexes);
