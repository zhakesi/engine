// /*
//  Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

//  https://www.cocos.com/

//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights to
//  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
//  of the Software, and to permit persons to whom the Software is furnished to do so,
//  subject to the following conditions:

//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.

//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
// */

// import { TrackEntryListeners } from './track-entry-listeners';
// import { SPINE_WASM } from './lib/instantiated';
// import spine from './lib/spine-core.js';
// import { Texture2D } from '../asset/assets';

// const MaxCacheTime = 30;
// const FrameTime = 1 / 60;
// const spineTag = SPINE_WASM;

// export interface SkeletonCacheItemInfo {
//     skeleton: spine.Skeleton;
//     state: spine.AnimationState;
//     listener: TrackEntryListeners;
//     curAnimationCache: AnimationCache | null;
//     animationsCache: { [key: string]: AnimationCache };
// }

// export interface FrameColor {
//     fr: number;
//     fg: number;
//     fb: number;
//     fa: number;
//     dr: number;
//     dg: number;
//     db: number;
//     da: number;
//     vfOffset: number;
// }

// export interface FrameSegment {
//     indexCount: number;
//     vfCount: number;
//     vertexCount: number;
//     tex?: Texture2D;
//     blendMode?: spine.BlendMode;
// }
// export interface AnimationFrame {
//     segments: FrameSegment[];
//     colors: FrameColor[];
//     boneInfos: spine.Bone[];
//     vertices: Float32Array;
//     indices: Uint16Array;
// }

// // Cache all frames in an animation
// export class AnimationCache {
//     public frames: AnimationFrame[] = [];
//     public totalTime = 0;
//     public isCompleted = false;
//     public maxVertexCount = 0;
//     public maxIndexCount = 0;

//     /**
//      * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
//      */
//     public _privateMode = false;
//     protected _inited = false;
//     protected _invalid = true;
//     protected _enableCacheAttachedInfo = false;
//     protected _frameIdx = -1;
//     protected _skeletonInfo: SkeletonCacheItemInfo | null = null;
//     protected _animationName: string | null = null;
//     protected _tempSegments: FrameSegment[] | null = null;
//     protected _tempColors: FrameColor[] | null = null;
//     protected _tempBoneInfos: spine.Bone[] | null = null;

//     constructor () {
//         this._privateMode = false;
//         this._inited = false;
//         this._invalid = true;
//         this._enableCacheAttachedInfo = false;
//         this.frames = [];
//         this.totalTime = 0;
//         this._frameIdx = -1;
//         this.isCompleted = false;

//         this._skeletonInfo = null;
//         this._animationName = null;
//         this._tempSegments = null;
//         this._tempColors = null;
//         this._tempBoneInfos = null;
//     }

//     public init (skeletonInfo: SkeletonCacheItemInfo, animationName: string) {
//         this._inited = true;
//         this._animationName = animationName;
//         this._skeletonInfo = skeletonInfo;
//     }

//     // Clear texture quote.
//     public clear () {
//         this._inited = false;
//         for (let i = 0, n = this.frames.length; i < n; i++) {
//             const frame = this.frames[i];
//             frame.segments.length = 0;
//         }
//         this.invalidAllFrame();
//     }

//     public bind (listener: TrackEntryListeners) {
//         const completeHandle = (entry: spine.TrackEntry) => {
//             if (entry && entry.animation.name === this._animationName) {
//                 this.isCompleted = true;
//             }
//         };

//         listener.complete = completeHandle;
//     }

//     public unbind (listener: TrackEntryListeners) {
//         (listener as any).complete = null;
//     }

//     public begin () {
//         if (!this._invalid) return;

//         const skeletonInfo = this._skeletonInfo;
//         const preAnimationCache = skeletonInfo?.curAnimationCache;

//         if (preAnimationCache && preAnimationCache !== this) {
//             if (this._privateMode) {
//                 // Private cache mode just invalid pre animation frame.
//                 preAnimationCache.invalidAllFrame();
//             } else {
//                 // If pre animation not finished, play it to the end.
//                 preAnimationCache.updateToFrame();
//             }
//         }

//         const skeleton = skeletonInfo?.skeleton;
//         const listener = skeletonInfo?.listener;
//         const state = skeletonInfo?.state;

//         const animation = skeleton?.data.findAnimation(this._animationName!);
//         state?.setAnimationWith(0, animation!, false);
//         this.bind(listener!);

//         // record cur animation cache
//         skeletonInfo!.curAnimationCache = this;
//         this._frameIdx = -1;
//         this.isCompleted = false;
//         this.totalTime = 0;
//         this._invalid = false;
//     }

//     public end () {
//         if (!this.needToUpdate()) {
//             // clear cur animation cache
//             this._skeletonInfo!.curAnimationCache = null;
//             this.frames.length = this._frameIdx + 1;
//             this.isCompleted = true;
//             this.unbind(this._skeletonInfo!.listener);
//         }
//     }

//     public updateToFrame (toFrameIdx?: number) {
//         if (!this._inited) return;

//         this.begin();

//         if (!this.needToUpdate(toFrameIdx)) return;

//         const skeletonInfo = this._skeletonInfo;
//         const skeleton = skeletonInfo?.skeleton;
//         const state = skeletonInfo?.state;

//         do {
//             // Solid update frame rate 1/60.
//             skeleton?.update(FrameTime);
//             state?.update(FrameTime);
//             state?.apply(skeleton!);
//             skeleton?.updateWorldTransform();
//             this._frameIdx++;
//             this.updateFrame(skeleton!, this._frameIdx);
//             this.totalTime += FrameTime;
//         } while (this.needToUpdate(toFrameIdx));

//         this.end();
//     }

//     public isInited () {
//         return this._inited;
//     }

//     public isInvalid () {
//         return this._invalid;
//     }

//     public invalidAllFrame () {
//         this.isCompleted = false;
//         this._invalid = true;
//     }

//     public updateAllFrame () {
//         this.invalidAllFrame();
//         this.updateToFrame();
//     }

//     public enableCacheAttachedInfo () {
//         if (!this._enableCacheAttachedInfo) {
//             this._enableCacheAttachedInfo = true;
//             this.invalidAllFrame();
//         }
//     }

//     protected updateFrame (skeleton: spine.Skeleton, index: number) {
//     }

//     protected needToUpdate (toFrameIdx?: number) {
//         return !this.isCompleted
//             && this.totalTime < MaxCacheTime
//             && (toFrameIdx === undefined || this._frameIdx < toFrameIdx);
//     }
// }

// class SkeletonCache {
//     public static readonly FrameTime = FrameTime;
//     public static sharedCache = new SkeletonCache();

//     protected _privateMode: boolean;
//     protected _skeletonCache: { [key: string]: SkeletonCacheItemInfo };
//     protected _animationPool: { [key: string]: AnimationCache };
//     constructor () {
//         this._privateMode = false;
//         this._animationPool = {};
//         this._skeletonCache = {};
//     }

//     public enablePrivateMode () {
//         this._privateMode = true;
//     }

//     public clear () {
//         this._animationPool = {};
//         this._skeletonCache = {};
//     }

//     public removeSkeleton (uuid: string) {
//         const skeletonInfo = this._skeletonCache[uuid];
//         if (!skeletonInfo) return;
//         const animationsCache = skeletonInfo.animationsCache;
//         for (const aniKey in animationsCache) {
//             // Clear cache texture, and put cache into pool.
//             // No need to create TypedArray next time.
//             const animationCache = animationsCache[aniKey];
//             if (!animationCache) continue;
//             this._animationPool[`${uuid}#${aniKey}`] = animationCache;
//             animationCache.clear();
//         }

//         delete this._skeletonCache[uuid];
//     }

//     public getSkeletonCache (uuid: string, skeletonData: spine.SkeletonData) {
//         let skeletonInfo = this._skeletonCache[uuid];
//         if (!skeletonInfo) {
//             const skeleton = new spine.Skeleton(skeletonData);
//             const stateData = new spine.AnimationStateData(skeleton.data);
//             const state = new spine.AnimationState(stateData);
//             // const listener = new TrackEntryListeners();
//             // state.addListener(listener as any);

//             this._skeletonCache[uuid] = skeletonInfo = {
//                 skeleton,
//                 state,
//                 //listener,
//                 // Cache all kinds of animation frame.
//                 // When skeleton is dispose, clear all animation cache.
//                 animationsCache: {} as any,
//                 curAnimationCache: null,
//             };
//         }
//         return skeletonInfo;
//     }

//     public getAnimationCache (uuid: string, animationName: string) {
//         const skeletonInfo = this._skeletonCache[uuid];
//         if (!skeletonInfo) return null;

//         const animationsCache = skeletonInfo.animationsCache;
//         return animationsCache[animationName];
//     }

//     public invalidAnimationCache (uuid: string) {
//         const skeletonInfo = this._skeletonCache[uuid];
//         const skeleton = skeletonInfo && skeletonInfo.skeleton;
//         if (!skeleton) return;

//         const animationsCache = skeletonInfo.animationsCache;
//         for (const aniKey in animationsCache) {
//             const animationCache = animationsCache[aniKey];
//             animationCache.invalidAllFrame();
//         }
//     }

//     public initAnimationCache (uuid: string, animationName: string): null | AnimationCache {
//         if (!animationName) return null;
//         const skeletonInfo = this._skeletonCache[uuid];
//         const skeleton = skeletonInfo && skeletonInfo.skeleton;
//         if (!skeleton) return null;

//         const animation = skeleton.data.findAnimation(animationName);
//         if (!animation) {
//             return null;
//         }

//         const animationsCache = skeletonInfo.animationsCache;
//         let animationCache = animationsCache[animationName];
//         if (!animationCache) {
//             // If cache exist in pool, then just use it.
//             const poolKey = `${uuid}#${animationName}`;
//             animationCache = this._animationPool[poolKey];
//             if (animationCache) {
//                 delete this._animationPool[poolKey];
//             } else {
//                 animationCache = new AnimationCache();
//                 animationCache._privateMode = this._privateMode;
//             }
//             animationCache.init(skeletonInfo, animationName);
//             animationsCache[animationName] = animationCache;
//         }
//         return animationCache;
//     }

//     public updateAnimationCache (uuid: string, animationName: string): void {
//         if (animationName) {
//             const animationCache = this.initAnimationCache(uuid, animationName);
//             if (!animationCache) return;
//             animationCache.updateAllFrame();
//         } else {
//             const skeletonInfo = this._skeletonCache[uuid];
//             const skeleton = skeletonInfo && skeletonInfo.skeleton;
//             if (!skeleton) return;

//             const animationsCache = skeletonInfo.animationsCache;
//             for (const aniKey in animationsCache) {
//                 const animationCache = animationsCache[aniKey];
//                 animationCache.updateAllFrame();
//             }
//         }
//     }
// }

// export default SkeletonCache;
