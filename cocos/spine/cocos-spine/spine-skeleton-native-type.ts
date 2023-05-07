import { Material, Texture2D } from '../../asset/assets';
import { NativeRenderEntity } from '../../2d/renderer/native-2d';

export declare class NativeSpineSkeletonInstance {
    constructor();
    initSkeletonData(jsonStr: string, atlasText: string);
    initSkeletonDataBinary(dataPath: string, atlasText: string);
    setSkin(name: string);
    setAnimation(trackIndex: number, name: string, loop: boolean): boolean;
    updateAnimation(dltTime: number);
    setTimeScale(timeScale: number);
    updateRenderData(): any;
}

export declare class NativeSpineSkeletonUI {
    constructor();
    updateRenderData();
    setSkeletonInstance(obj: NativeSpineSkeletonInstance);
    setSkeletonRendererer(rendererUI: NativeSpineSkeletonRendererUI);
}

export declare class NativeSpineSkeletonRendererUI {
    constructor();
    setTexture (tex: Texture2D);
    setRenderEntity(nativeEntity: NativeRenderEntity);
    setMaterial(mat: Material);
}
