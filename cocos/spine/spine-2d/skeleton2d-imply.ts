import { SkeletonData } from '../skeleton-data';
import { SKMesh } from './sk-mesh';

export interface Skeleton2DImply {
    initSkeletonData (data: SkeletonData): boolean;
    setSkin (name: string): boolean;
    setAnimation (name: string): boolean;
    updateAnimation (dltTime: number);
    updateRenderData (): SKMesh[];
}
