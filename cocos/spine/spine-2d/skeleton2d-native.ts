import { SkeletonData } from '../skeleton-data';
import { SKMesh } from './sk-mesh';
import { Skeleton2DImply } from './skeleton2d-imply';

export class Skeleton2DNative implements Skeleton2DImply {
    initSkeletonData (data: SkeletonData): boolean {
        throw new Error('Method not implemented.');
    }
    setSkin (name: string): boolean {
        throw new Error('Method not implemented.');
    }
    setAnimation (name: string): boolean {
        throw new Error('Method not implemented.');
    }
    updateAnimation (dltTime: number) {
        throw new Error('Method not implemented.');
    }
    updateRenderData (): SKMesh[] {
        throw new Error('Method not implemented.');
    }
}
