import { registerAfterWasmInit, getSpineWasm } from './instantiated';

declare namespace spineDefine {
    class SkeletonInstance {}
    class Skeleton {}
    class SkeletonData {}
    class AnimationState {}
    class JitterEffect {}
    class SwirlEffect {}
    class Pow {}
    class PowOut {}
}

export const spineX: typeof spineDefine & {HEAP8: Uint8Array} = {} as any;

function overrideSpineDefine () {
    const wasm = getSpineWasm();
    spineX.SkeletonData = wasm.SkeletonData;
    spineX.Skeleton = wasm.Skeleton;
    spineX.AnimationState = wasm.AnimationState;
    spineX.JitterEffect = wasm.JitterEffect;
    spineX.SwirlEffect = wasm.SwirlEffect;
    spineX.Pow = wasm.Pow;
    spineX.PowOut = wasm.PowOut;
    spineX.SkeletonInstance = wasm.SkeletonInstance;

    spineX.HEAP8 = wasm.HEAPU8;
}
registerAfterWasmInit(overrideSpineDefine);
