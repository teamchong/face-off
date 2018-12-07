import { RefObject } from 'react';

export interface FaceOffModel {
  readonly isAppStarted: boolean;
  readonly tab: string;
  readonly message: string;
  readonly images: HTMLImageElement[];
  readonly imageFaceDetctResults: Array<any[]>;
  readonly videoDetctResults: any[];
  readonly webcamDetctResults: any[];
  readonly facingMode: string;
  readonly youtubeUrl: string;
  readonly youtubeUrlLoaded: string;
  readonly mp4Url: string;
  readonly videoRef: RefObject<HTMLVideoElement>;
  readonly isModelsLoaded: boolean;
  readonly isFaceDetecting: boolean;
  readonly isVideoLoaded: boolean;
  readonly isWebcamLoaded: boolean;
}
