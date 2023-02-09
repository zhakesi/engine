import { SkeletonData } from '../skeleton-data';
import { SKMesh } from './sk-mesh';
import { Skeleton2DImply } from './skeleton2d-imply';
import { NativeSkeleton2D } from './skeleton2d-native';

export class Skeleton2DImplyNative implements Skeleton2DImply {
    protected declare _nativeObj: NativeSkeleton2D;

    constructor () {
        this._nativeObj = new NativeSkeleton2D();
    }

    initSkeletonData (data: SkeletonData): boolean {
        this._nativeObj.nativeFunctionTest();
        return true;
    }
    setSkin (name: string): boolean {
        return true;
    }
    setAnimation (name: string): boolean {
        return true;
    }
    updateAnimation (dltTime: number) {
        return true;
    }
    updateRenderData (): SKMesh[] {
        return [];
    }
}
