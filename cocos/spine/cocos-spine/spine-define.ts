import { registerAfterWasmInit, getSpineWasm } from './instantiated';

declare namespace spineDefine {
    class SkeletonInstance {
        //
    }

    class Skeleton {
        //
    }
}

export const spineX: typeof spineDefine = {} as any;

function overrideSpineDefine () {
    const wasm = getSpineWasm();
    spineX.Skeleton = wasm.Skeleton;
    spineX.SkeletonInstance = wasm.SkeletonInstance;
}
registerAfterWasmInit(overrideSpineDefine);
