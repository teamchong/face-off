import { RefObject } from 'react';
import * as Webcam from 'react-webcam';

export interface FaceOffModel {
  readonly isAppStarted: boolean;
  readonly tab: string;
  readonly message: string;
  readonly images: HTMLImageElement[];
  readonly imageDetectResults: Array<any[]>;
  readonly videoDetectResults: any[];
  readonly webcamDetectResults: any[];
  readonly facingMode: string;
  readonly youtubeUrl: string;
  readonly youtubeUrlLoaded: string;
  readonly mp4Url: string;
  readonly videoRef: RefObject<HTMLVideoElement>;
  readonly webcamRef: RefObject<Webcam>;
  readonly isModelsLoaded: boolean;
  readonly isVideoLoaded: boolean;
  readonly isWebcamLoaded: boolean;
}
