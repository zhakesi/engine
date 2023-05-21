import { registerAfterWasmInit, getSpineWasm } from './instantiated';

declare namespace spineDefine {
    class SkeletonInstance {
    }

    class Skeleton {
        //
    }

    class SkeletonData {

    }

    class AnimationState {

    }
}

export const spineX: typeof spineDefine & {HEAP8: Uint8Array} = {} as any;

function overrideSpineDefine () {
    const wasm = getSpineWasm();
    spineX.SkeletonData = wasm.SkeletonData;
    spineX.Skeleton = wasm.Skeleton;
    spineX.SkeletonInstance = wasm.SkeletonInstance;
    spineX.HEAP8 = wasm.HEAPU8;
}
registerAfterWasmInit(overrideSpineDefine);
