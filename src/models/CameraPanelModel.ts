import { RefObject } from 'react';

export interface CameraPanelModel {
  readonly appStarted: boolean;
  readonly tab: string;
  readonly message: string;
  readonly images: HTMLImageElement[];
  readonly facingMode: string;
  readonly youtubeUrl: string;
  readonly youtubeUrlLoaded: string;
  readonly mp4Url: string;
  readonly videoRef: RefObject<HTMLVideoElement>;
  readonly modelsLoaded: boolean;
}
