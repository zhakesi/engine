/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { TrackEntryListeners } from './track-entry-listeners';
import { SPINE_WASM } from './lib/instantiated';
import spine from './lib/spine-core.js';
import { SkeletonData } from './skeleton-data';

const MaxCacheTime = 30;
const FrameTime = 1 / 60;
const spineTag = SPINE_WASM;
const _useTint = false;

class SpineModel {
    public vCount = 0;
    public iCount = 0;
    public vData: Uint8Array = null!;
    public iData: Uint16Array = null!;
    public meshes: SpineMesh[] = [];
}

class SpineMesh {
    public iCount = 0;
    public blendMode = 0;
}

export interface AnimationFrame {
    model: SpineModel;
    boneInfos: any[];
}

export class AnimationCache {
    protected _instance: spine.SkeletonInstance = null!;
    protected _state: spine.AnimationState = null!;
    protected _skeletonData: spine.SkeletonData = null!;
    protected _frames: AnimationFrame[] = [];
    protected _curIndex = -1;
    protected _isCompleted = false;
    protected _maxFrameIdex = 0;

    constructor (data: spine.SkeletonData) {
        this._instance = new spine.SkeletonInstance();
        this._skeletonData = data;
        this._instance.initSkeleton(data);
        this._state = this._instance.getAnimationState();
        this._instance.setUseTint(_useTint);
    }
    public setAnimation (animationName: string) {
        const animations = this._skeletonData.animations;
        let animation: spine.Animation | null = null;
        animations.forEach((element) => {
            if (element.name === animationName) {
                animation = element;
            }
        });
        //const animation = this._skeletonData.findAnimation(animationName);
        if (!animation) {
            console.warn(`find no animation named ${animationName} !!!`);
            return;
        }
        this._maxFrameIdex = Math.floor(animation.duration / FrameTime);
        this._instance.setAnimation(0, animationName, false);
    }

    public updateToFrame (frameIdx: number) {
        if (this._isCompleted) return;
        while (this._curIndex < frameIdx) {
            this._instance.updateAnimation(FrameTime);
            this._curIndex++;
            const model = this._instance.updateRenderData();
            this.updateRenderData(this._curIndex, model);
            if (this._curIndex >= this._maxFrameIdex) {
                this._isCompleted = true;
            }
        }
    }

    public getFrame (frameIdx: number) {
        const index = frameIdx % this._maxFrameIdex;
        return this._frames[index];
    }

    private updateRenderData (index: number, model: any) {
        const vc = model.vCount;
        const ic = model.iCount;
        const floatStride = _useTint ? 7 : 6;
        const vUint8Buf = new Uint8Array(4 * floatStride * vc);
        const iUint16Buf = new Uint16Array(ic);

        const vPtr = model.vPtr;
        const vLength = vc * 4 * floatStride;
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const vData = spine.wasmUtil.HEAPU8.subarray(vPtr, vPtr + vLength);

        vUint8Buf.set(vData);

        const iPtr = model.iPtr;
        const iLength = 2 * ic;
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const iData = spine.wasmUtil.HEAPU8.subarray(iPtr, iPtr + iLength);
        const iUint8Buf = new Uint8Array(iUint16Buf.buffer);
        iUint8Buf.set(iData);

        const modelData = new SpineModel();
        modelData.vCount = vc;
        modelData.iCount = ic;
        modelData.vData = vUint8Buf;
        modelData.iData = iUint16Buf;

        const meshes = model.getMeshes();
        const count = meshes.size();
        for (let i = 0; i < count; i++) {
            const mesh = meshes.get(i);
            const meshData = new SpineMesh();
            meshData.iCount = mesh.iCount;
            meshData.blendMode = mesh.blendMode;
            modelData.meshes.push(meshData);
        }

        this._frames[index] = {
            model: modelData,
            boneInfos: [],
        };
    }

    public destory () {
        spine.wasmUtil.destroySpineInstance(this._instance);
    }
}

class SkeletonCache {
    public static sharedCache = new SkeletonCache();
    protected _animationPool: { [key: string]: AnimationCache };
    constructor () {
        this._animationPool = {};
    }

    public getAnimationCache (uuid: string, animationName: string) {
        const poolKey = `${uuid}#${animationName}`;
        const animCache = this._animationPool[poolKey];
        return animCache;
    }

    public initAnimationCache (data: SkeletonData, animationName: string) {
        const uuid = data.uuid;
        const poolKey = `${uuid}#${animationName}`;
        const spData = data.getRuntimeData();
        const animCache = new AnimationCache(spData!);
        this._animationPool[poolKey] = animCache;
        animCache.setAnimation(animationName);
        return animCache;
    }

    public removeCachedAnimations (uuid: string) {
        const animationPool = this._animationPool;
        for (const key in animationPool) {
            if (key.includes(uuid)) {
                animationPool[key].destory();
                delete animationPool[key];
            }
        }
    }
}

export default SkeletonCache;
