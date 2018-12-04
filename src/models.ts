import * as Dropzone from 'react-dropzone';

export interface CameraPanelModel {
  readonly tab: string;
  readonly message: string;
  readonly images: Readonly<{ name: string; preview: string }>[];
  readonly facingMode: string;
  readonly youtubeUrl: string;
  readonly mp4Url: string;
}
