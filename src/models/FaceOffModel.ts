import { RefObject } from 'react';
import * as Webcam from 'react-webcam';

export interface IFaceDetectResults {
  [id: string]: {
    name?: string;
    gender?: string;
    age?: number;
    preview: string;
    video: { [url: string]: Set<number> };
    webcam: Set<number>;
    imageIds: Set<string>;
    descriptor: Float32Array;
  };
}

export interface IFaceOffModel {
  readonly isAppRunning: boolean;
  readonly isModelsLoaded: boolean;
  readonly isVideoLoaded: boolean;
  readonly isWebcamLoaded: boolean;
  readonly tab: string;
  readonly message: string | null;
  readonly facingMode: string;
  readonly videoUrl: string;
  readonly videoUrlLoaded: string;
  readonly mp4Url: string;
  readonly videoRef: RefObject<HTMLVideoElement>;
  readonly webcamRef: RefObject<Webcam>;
  readonly images: HTMLImageElement[];
  readonly videoOverlayRef: RefObject<HTMLCanvasElement>;
  readonly webcamOverlayRef: RefObject<HTMLCanvasElement>;
  readonly imagesOverlaies: { [id: string]: string };
  readonly imagesDetectResults: { [id: string]: any[] };
  readonly faces: IFaceDetectResults;
  readonly openImageId: string;
}
