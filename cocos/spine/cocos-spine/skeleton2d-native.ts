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

    public clone (): Skeleton2DMesh {
        const newOne = new Skeleton2DMesh();
        newOne.slotIndex = this.slotIndex;
        newOne.vCount = this.vCount;
        newOne.iCount = this.iCount;
        newOne.byteStride = this.byteStride;
        newOne.vertices = new Float32Array(this.vertices.length);
        newOne.indices = new Uint16Array(this.indices.length);
        newOne.vertices.set(this.vertices);
        newOne.indices.set(this.indices);

        this.blendInfos.forEach((item) => {
            newOne.blendInfos.push({
                blendMode: item.blendMode,
                indexOffset: item.indexOffset,
                indexCount: item.indexCount });
        });

        return newOne;
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
