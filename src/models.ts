import * as Dropzone from 'react-dropzone';
import { FACINGMODE_FRONT, FACINGMODE_BACK } from './constants';

export interface CameraPanelModel {
  readonly tab: string;
  readonly message: string;
  readonly images: Readonly<{ name: string; preview: string }>[];
  readonly facingMode: FACINGMODE_FRONT | FACINGMODE_BACK;
}
