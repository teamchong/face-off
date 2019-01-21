export * from './models/FaceOffModel';
import { FaceOffModel } from './models/FaceOffModel';

export interface IRootState {
  readonly faceOffPanel: FaceOffModel;
}
