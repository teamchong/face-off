import { canvasToBlob, createObjectURL, revokeObjectURL } from 'blob-util';
import { MAX_WIDTH, MAX_HEIGHT } from '../constants';

export const readAsImage = async (file: File): Promise<HTMLImageElement> => {
  const dataUrl = createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imgEl = new Image();
    imgEl.title = file.name;
    imgEl.onload = () => resolve(imgEl);
    imgEl.onerror = error => reject(error);
    imgEl.src = dataUrl;
  });
  if (img.width > MAX_WIDTH) {
    const newHeight = ~~((MAX_WIDTH * img.height) / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = MAX_WIDTH;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (ctx !== null) {
      ctx.drawImage(img, 0, 0, MAX_WIDTH, newHeight);
      const src = createObjectURL(await canvasToBlob(ctx.canvas, 'image/png'));
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgEl = new Image();
        imgEl.title = file.name;
        imgEl.onload = () => resolve(imgEl);
        imgEl.onerror = error => reject(error);
        imgEl.src = src;
        revokeObjectURL(dataUrl);
      });
    }
  }
  return img;
};
