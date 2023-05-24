import { registerAfterWasmInit, getSpineWasm } from './instantiated';
import { spinex, spineWasmModule } from './spine-core-x';

function overrideSpineDefine () {
    const wasm = getSpineWasm();
    spinex.SkeletonData = wasm.SkeletonData;
    spinex.Skeleton = wasm.Skeleton;
    spinex.AnimationState = wasm.AnimationState;
    spinex.JitterEffect = wasm.JitterEffect;
    spinex.SwirlEffect = wasm.SwirlEffect;
    spinex.Pow = wasm.Pow;
    spinex.PowOut = wasm.PowOut;

    spineWasmModule.SkeletonInstance = wasm.SkeletonInstance;
}
registerAfterWasmInit(overrideSpineDefine);
