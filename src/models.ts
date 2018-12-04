import * as Dropzone from 'react-dropzone';

export interface CameraPanelModel {
  readonly tab: string;
  readonly message: string;
  readonly images: Dropzone.ImageFile[];
}
