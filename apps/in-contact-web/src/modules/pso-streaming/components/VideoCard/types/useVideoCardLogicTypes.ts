/**
 * @fileoverview useVideoCardLogic hook types
 * @summary Type definitions for useVideoCardLogic hook
 * @description Type definitions for useVideoCardLogic hook options and return type
 */

import type { IVideoCardProps } from '../../types/videoCardTypes';
import type { IVideoCardHeaderProps } from './videoCardComponentTypes';
import type { IVideoCardDisplayProps } from './videoCardComponentTypes';
import type { IVideoCardControlsProps } from './videoCardComponentTypes';
import type { IVideoCardSnapshotModalProps } from './videoCardComponentTypes';

/**
 * Options for useVideoCardLogic hook
 */
export interface IUseVideoCardLogicOptions extends IVideoCardProps {
  // Props are passed directly from IVideoCardProps
}

/**
 * Return type for useVideoCardLogic hook
 */
export interface IUseVideoCardLogicReturn {
  headerProps: IVideoCardHeaderProps;
  displayProps: IVideoCardDisplayProps;
  controlsProps: IVideoCardControlsProps;
  modalProps: IVideoCardSnapshotModalProps;
}

