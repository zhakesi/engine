import { SkeletonData } from '../skeleton-data';
import { NativeSpineSkeletonInstance } from './spine-skeleton-native-type';

export class SpineSkeletonInstance {
    constructor () {
        this._nativeObj = new NativeSpineSkeletonInstance();
    }

    public getNativeObject() {
        return this._nativeObj;
    }

    public onDestroy () {

    }
    public updateRenderData() {
        this._nativeObj.updateRenderData();
    }

    public setSkeletonData (data: SkeletonData) {
        if (!data.atlasText) return;
        if (data.skeletonJsonStr) {
            this._nativeObj.initSkeletonData(data.skeletonJsonStr, data.atlasText);
        } else if (data.nativeUrl.length > 0) {
            this._nativeObj.initSkeletonDataBinary(data.nativeUrl, data.atlasText);
        }
        return;
    }

    public setSkin (name: string): boolean {
        return this._nativeObj.setSkin(name);
    }

    public setAnimation (trackIdex: number, name: string, loop: boolean): boolean {
        this._nativeObj.setAnimation(trackIdex, name, loop);
        return true;
    }

    public setTimeScale (timeScale: number) {
        this._nativeObj.setTimeScale(timeScale);
    }

    public updateAnimation (dltTime: number) {
        this._nativeObj.updateAnimation(dltTime);
    }

    public setPremultipliedAlpha (premultipliedAlpha: boolean) {

    }

    public getSlotsTable (): Map<number, string | null> {
        return new Map<number, string | null>();
    }

    private declare _nativeObj: NativeSpineSkeletonInstance;
}
