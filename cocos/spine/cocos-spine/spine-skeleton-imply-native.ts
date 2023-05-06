import { SkeletonData } from '../skeleton-data';

declare const cocosSpine: any;
declare class NativeSpineSkeletonInstance {
    constructor();
}

export class SpineSkeletonInstance {
    constructor () {
        this._nativeObj = new NativeSpineSkeletonInstance();
    }

    public onDestroy () {

    }

    public setSkeletonData (data: SkeletonData) {

    }

    setSkin (name: string): boolean {
        return true;
    }

    public setPremultipliedAlpha (premultipliedAlpha: boolean) {

    }

    private declare _nativeObj: NativeSpineSkeletonInstance;
}

export const NativeSpineSkeletonInstance = cocosSpine.SpineSkeletonInstance;
// export const SpineSkeletonMesh = cocosSpine.SpineSkeletonMesh;
// export const NativeSpineSkeletonRendererUI = cocosSpine.SpineSpineSkeletonRendererUI;
// export const NativeSpineSkeletonUI = cocosSpine.SpineSkeletonUI;


