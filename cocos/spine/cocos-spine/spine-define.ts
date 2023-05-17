import { registerAfterWasmInit, getSpineWasm } from './instantiated';

declare namespace spineDefine {
    class SkeletonInstance {
        //
    }

    class Skeleton {
        //
    }

    class SkeletonData {

    }
}

export const spineX: typeof spineDefine = {} as any;

function overrideSpineDefine () {
    const wasm = getSpineWasm();
    spineX.SkeletonData = wasm.SkeletonData;
    spineX.Skeleton = wasm.Skeleton;
    spineX.SkeletonInstance = wasm.SkeletonInstance;
}
registerAfterWasmInit(overrideSpineDefine);
