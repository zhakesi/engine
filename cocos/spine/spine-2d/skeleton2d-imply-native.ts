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
        if (data.skeletonJsonStr && data.atlasText) {
            this._nativeObj.initSkeletonData(data.skeletonJsonStr, data.atlasText);
        }

        return true;
    }
    setSkin (name: string): boolean {
        this._nativeObj.setSkin(name);
        return true;
    }
    setAnimation (name: string): boolean {
        this._nativeObj.setAnimation(name);
        return true;
    }
    updateAnimation (dltTime: number) {
        this._nativeObj.updateAnimation(dltTime);
        return true;
    }
    updateRenderData (): SKMesh[] {
        return [];
    }
}
