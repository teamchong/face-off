import { canvasToBlob, createObjectURL } from 'blob-util';
// import {
//   drawDetection,
// } from 'face-api.js';
//const FaceDetectModel = loadSsdMobilenetv1Model;
// const FaceDetectOptions = (opts?: any) =>
//   new (SsdMobilenetv1Options as any)(opts);
import { drawDetection } from 'face-api.js';

// import {
//   detectAllFaces,
//   extractFaces,
//   SsdMobilenetv1Options,
// } from 'face-api.js';
// const FaceDetectOptions = (opts?: any) =>
//   new (SsdMobilenetv1Options as any)(opts);
import {
  detectAllFaces,
  extractFaces,
  FaceMatcher,
  TinyFaceDetectorOptions,
} from 'face-api.js';
import { from, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

const FaceDetectOptions = (opts?: any) =>
  new (TinyFaceDetectorOptions as any)(opts);

export const compareFaces = (descriptor1: any, descriptor2: any): boolean => {
  if (!descriptor1 || !descriptor2) {
    return false;
  }
  const faceMatcher = new FaceMatcher(descriptor1);
  const distance = faceMatcher.computeMeanDistance(descriptor1, [descriptor2]);
  return distance >= 0.6;
};

export const uniqueId = () =>
  `_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

export const drawVideo = (
  video: HTMLVideoElement,
  videoCtx: CanvasRenderingContext2D
) => {
  const { videoWidth, videoHeight } = video;
  videoCtx.canvas.width = videoWidth;
  videoCtx.canvas.height = videoHeight;
  videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
};

export const generatePreview = async (
  canvas: HTMLCanvasElement,
  detection: any
): Promise<string> => {
  var thumb = await extractFaces(canvas, [detection]);
  if (thumb[0]) {
    return createObjectURL(await canvasToBlob(thumb[0]));
  }
  return '';
};

export const startDetectFaces = async (
  canvas: HTMLCanvasElement | HTMLImageElement,
  inputSize: number
) => {
  return await from(
    detectAllFaces(canvas, FaceDetectOptions({ inputSize }))
      .withFaceLandmarks()
      .withFaceDescriptors()
  )
    .pipe(
      timeout(1000),
      catchError(() => of([]))
    )
    .toPromise();
};

export const drawDetections = (
  detection: any[],
  canvas: HTMLCanvasElement,
  srcWidth: number,
  srcHeight: number
) => {
  if (canvas && canvas.width) {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    //console.log({ width, height, videoWidth, videoHeight });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(~~((width - srcWidth) / 2.0), ~~((height - srcHeight) / 2.0));
    if (detection.length) {
      drawDetection(canvas, detection, { withScore: false });
      //console.log({ video: payload });
    }
    //observer.next(detectedVideoFaces(result));
  }
};
