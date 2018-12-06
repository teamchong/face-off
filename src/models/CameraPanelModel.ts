import { RefObject } from "react";

export interface ImageModel {
  name: string;
  width: number;
  height: number;
  preview: string;
}

export interface CameraPanelModel {
  readonly tab: string;
  readonly message: string;
  readonly images: Readonly<ImageModel>[];
  readonly facingMode: string;
  readonly youtubeUrl: string;
  readonly youtubeUrlLoaded: string;
  readonly mp4Url: string;
  readonly videoRef: RefObject<HTMLVideoElement>;
  readonly modelsLoaded: boolean;
}
