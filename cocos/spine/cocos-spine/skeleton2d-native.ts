import { NativeRenderEntity } from '../../2d/renderer/native-2d';
import { Material, Texture2D } from '../../asset/assets';

export declare class NativeSkeleton2D {
    initSkeletonData(jsonStr: string, atlasText: string);
    initSkeletonDataBinary(dataPath: string, atlasText: string);
    setSkin(name: string);
    setAnimation (name: string);
    updateAnimation(dltTime: number);
}

export declare class NativePartialRendererUI {
    setRenderEntity(nativeEntity: NativeRenderEntity);
    setMaterial(mat: Material);
    setTexture(tex: Texture2D);
}

export declare class NativeSpineSkeletonUI {
    setSkeletonInstance(obj: NativeSkeleton2D);
    updateRenderData();
    setPartialRenderer(render: NativePartialRendererUI);
}
