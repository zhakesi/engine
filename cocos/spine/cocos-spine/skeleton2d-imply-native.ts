import { Mat4, Color } from '../../core';
import { SkeletonData } from '../skeleton-data';
import { Skeleton2DImply } from './skeleton2d-imply';
import { NativeSkeleton2D, Skeleton2DMesh } from './skeleton2d-native';
import { SpineJitterVertexEffect, SpineSwirlVertexEffect } from './spine-vertex-effect-wasm';

export class Skeleton2DImplyNative implements Skeleton2DImply {
    protected declare _nativeObj: NativeSkeleton2D;
    protected _nativeMeshArray: Skeleton2DMesh[] = [];

    constructor () {
        this._nativeObj = new NativeSkeleton2D();
    }
    get nativeObject () {
        return this._nativeObj;
    }

    initSkeletonData (data: SkeletonData): boolean {
        if (!data.atlasText) return false;
        if (data.skeletonJsonStr) {
            this._nativeObj.initSkeletonData(data.skeletonJsonStr, data.atlasText);
        } else if (data.nativeUrl.length > 0) {
            this._nativeObj.initSkeletonDataBinary(data.nativeUrl, data.atlasText);
        } else {
            return false;
        }

        return true;
    }
    setSkin (name: string): boolean {
        this._nativeObj.setSkin(name);
        return true;
    }
    setAnimation (trackIdex: number, name: string, loop: boolean): boolean {
        this._nativeObj.setAnimation(name);
        return true;
    }
    public setTimeScale (timeScale: number): boolean {
        return true;
    }

    updateAnimation (dltTime: number) {
        this._nativeObj.updateAnimation(dltTime);
        return true;
    }
    updateRenderData (): Skeleton2DMesh[] {
        this._nativeMeshArray = this._nativeObj.updateRenderData();
        return this._nativeMeshArray;
    }

    getSlotsTable (): Map<number, string | null> {
        const table = new Map<number, string>();
        table.set(0, 'body');
        table.set(1, 'head');
        return table;
    }

    getBoneMatrix (idx: number, matrix: Mat4) {

    }

    public setDefaultScale (scale: number) {
    }

    public clearTrack (trackIndex: number) {

    }

    public clearTracks () {

    }

    public setToSetupPose () {

    }

    public setVertexEffect (effect: SpineJitterVertexEffect | SpineSwirlVertexEffect | null) {
    }

    public setMix (fromAnimation: string, toAnimation: string, duration: number) {

    }

    public setColor (color: Color) {

    }

    public setPremultipliedAlpha (premultipliedAlpha: boolean) {
    }
}
