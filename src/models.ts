export * from './models/FaceOffModel';
import { IFaceOffModel } from './models/FaceOffModel';

export interface IRootState {
  readonly faceOffPanel: IFaceOffModel;
}
