import { ActionType } from 'typesafe-actions';
import * as faceOffActions from './actions/FaceOffActions';

export * from './actions/FaceOffActions';
export type RootActions = ActionType<typeof faceOffActions>;
