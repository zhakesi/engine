import { Mat4 } from '../../core';
import { SkeletonData } from '../skeleton-data';
import { Skeleton2DMesh } from './skeleton2d-native';

export interface Skeleton2DImply {
    initSkeletonData (data: SkeletonData): boolean;
    setSkin (name: string): boolean;
    setAnimation (name: string, loop: boolean): boolean;
    setTimeScale(timeScale: number): boolean;
    updateAnimation (dltTime: number);
    updateRenderData (): Skeleton2DMesh[];
    getSlotsTable (): Map<number, string | null>;
    getBoneMatrix(idx: number, matrix: Mat4);
    setDefaultScale(scale: number);
}
