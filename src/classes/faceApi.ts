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
import { MODEL_URL } from '../constants';

// import { loadSsdMobilenetv1Model } from 'face-api.js';
// const FaceDetectModel = loadSsdMobilenetv1Model;
import {
  loadTinyFaceDetectorModel,
  loadFaceLandmarkModel,
  // loadFaceLandmarkTinyModel,
  loadFaceRecognitionModel,
} from 'face-api.js';
const FaceDetectModel = loadTinyFaceDetectorModel;

const FaceDetectOptions = (opts?: any) =>
  new (TinyFaceDetectorOptions as any)(opts);

export const initializeModels = async () => {
  await FaceDetectModel(MODEL_URL);
  await loadFaceLandmarkModel(MODEL_URL);
  // await loadFaceLandmarkTinyModel(MODEL_URL);
  await loadFaceRecognitionModel(MODEL_URL);
};

export const compareFaces = (descriptor1: any, descriptor2: any): boolean => {
  if (!descriptor1 || !descriptor2) {
    return false;
  }
  const faceMatcher = new FaceMatcher(descriptor1);
  const distance = faceMatcher.computeMeanDistance(descriptor1, [descriptor2]);
  return distance < 0.6;
};

export const uniqueId = () =>
  `_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

export const drawVideo = (video: HTMLVideoElement) => {
  const { videoWidth, videoHeight } = video;
  const canvas = document.createElement('canvas');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, videoWidth, videoHeight);
  return canvas;
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

export const detectVideo = async (
  canvas: HTMLCanvasElement | HTMLImageElement,
  inputSize: number,
  timeoutMs?: number
): Promise<{ detection: any[]; getDescriptor: () => Promise<any[]> }> => {
  const task = detectAllFaces(canvas, FaceDetectOptions({ inputSize })) as any;
  const detection = from(task)
    .pipe(timeout(timeoutMs))
    .toPromise() as Promise<any[]>;
  const getDescriptor = (): Promise<any[]> =>
    task.detectVideoFaces.withFaceLandmarks().withFaceDescriptors() as Promise<
      any[]
    >;
  return { detection: await detection, getDescriptor };
};

export const detectImage = (
  canvas: HTMLCanvasElement | HTMLImageElement,
  inputSize: number
): Promise<any[]> => {
  return (detectAllFaces(canvas, FaceDetectOptions({ inputSize }))
    .withFaceLandmarks()
    .withFaceDescriptors() as any) as Promise<any[]>;
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
  }
};
