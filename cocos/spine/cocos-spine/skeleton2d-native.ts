import { NativeRenderEntity } from '../../2d/renderer/native-2d';
import { Material, Texture2D } from '../../asset/assets';

/**
 * @internal
 */
export interface SpineMeshBlendInfo {
    blendMode: number;
    indexOffset: number;
    indexCount: number;
}
export class Skeleton2DMesh {
    constructor () {

    }
    public initialize (slot: number, vc: number, ic: number, stride: number) {
        this.slotIndex = slot;
        this.vCount = vc;
        this.iCount = ic;
        this.byteStride = stride;
        const floatNum = vc * this.byteStride / 4;
        this.vertices = new Float32Array(floatNum);
        this.indices = new Uint16Array(ic);
    }

    public declare slotIndex: number;
    public declare vCount: number;
    public declare iCount: number;
    public declare byteStride: number;
    public declare vertices: Float32Array;
    public declare indices: Uint16Array;
    public blendInfos: SpineMeshBlendInfo[] = [];
}

export declare class NativeSkeleton2D {
    initSkeletonData(jsonStr: string, atlasText: string);
    initSkeletonDataBinary(dataPath: string, atlasText: string);
    setSkin(name: string);
    setAnimation (name: string);
    updateAnimation(dltTime: number);
    updateRenderData(): Skeleton2DMesh[];
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
