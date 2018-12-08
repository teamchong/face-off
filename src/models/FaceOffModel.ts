import { RefObject } from 'react';
import * as Webcam from 'react-webcam';

export interface FaceOffModel {
  readonly isAppRunning: boolean;
  readonly isModelsLoaded: boolean;
  readonly isVideoLoaded: boolean;
  readonly isWebcamLoaded: boolean;
  readonly tab: string;
  readonly message: string;
  readonly facingMode: string;
  readonly videoUrl: string;
  readonly videoUrlLoaded: string;
  readonly mp4Url: string;
  readonly videoCtx: CanvasRenderingContext2D;
  readonly videoRef: RefObject<HTMLVideoElement>;
  readonly webcamRef: RefObject<Webcam>;
  readonly images: HTMLImageElement[];
  readonly videoOverlayRef: RefObject<HTMLCanvasElement>;
  readonly webcamOverlayRef: RefObject<HTMLCanvasElement>;
  readonly imagesOverlayRef: { [id: string]: RefObject<HTMLCanvasElement> };
  readonly imagesDetectResults: { [id: string]: any[] };
  readonly videoDetectResults: any[];
  readonly webcamDetectResults: any[];
}
