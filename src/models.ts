export * from './models/FaceOffModel';
import { FaceOffModel } from './models/FaceOffModel';

export type RootState = {
  readonly faceOffPanel: FaceOffModel;
};
