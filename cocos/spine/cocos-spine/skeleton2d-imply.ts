import { Mat4, Color } from '../../core';
import { SkeletonData } from '../skeleton-data';
import { Skeleton2DMesh } from './skeleton2d-native';
import { SpineJitterVertexEffect, SpineSwirlVertexEffect } from './spine-vertex-effect-wasm';

export interface Skeleton2DImply {
    initSkeletonData(data: SkeletonData): boolean;
    setSkin(name: string): boolean;
    setAnimation(trackIndex: number, name: string, loop: boolean): number;
    clearTrack(trackIndex: number);
    clearTracks();
    setToSetupPose();
    setTimeScale(timeScale: number): boolean;
    updateAnimation(dltTime: number);
    setMix(fromAnimation: string, toAnimation: string, duration: number): void;
    updateRenderData(): Skeleton2DMesh;
    getSlotsTable(): Map<number, string | null>;
    getBoneMatrix(idx: number, matrix: Mat4);
    setDefaultScale(scale: number);
    setPremultipliedAlpha(premultipliedAlpha: boolean);
    setColor(color: Color);

    setVertexEffect(effect: SpineJitterVertexEffect | SpineSwirlVertexEffect | null);
}
