import { timer } from 'rxjs';
// import {
//   drawDetection,
// } from 'face-api.js';
//const FaceDetectModel = loadSsdMobilenetv1Model;
// const FaceDetectOptions = (opts?: any) =>
//   new (SsdMobilenetv1Options as any)(opts);
import { drawDetection } from 'face-api.js';

export const drawDetections = async (
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
    await timer(0).toPromise();
  }
};
