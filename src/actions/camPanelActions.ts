import { action } from 'typesafe-actions';
import { SWITCHTAB_CAMPANEL } from '../constants';

export const switchTab = (tab: string) => action(SWITCHTAB_CAMPANEL, tab);
