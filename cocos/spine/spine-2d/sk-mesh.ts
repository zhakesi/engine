import { Model } from '../../render-scene/scene';
import { vfmtPosUvColor, getAttributeStride } from '../../2d/renderer/vertex-format';
import { PrimitiveMode, Device, BufferUsageBit, BufferInfo, MemoryUsageBit, deviceManager } from '../../gfx';
import { Material, Texture2D, RenderingSubMesh } from '../../asset/assets';
import { builtinResMgr } from '../../asset/asset-manager/builtin-res-mgr';

const floatStride = 9;
export class SKMesh {
    constructor (vc: number, ic: number) {
        this.vCount = vc;
        this.iCount = ic;
        const floatNum = floatStride * vc;
        this.vertices = new Float32Array(floatNum);
        this.indeices = new Uint16Array(ic);
    }

    public vCount: number;
    public iCount: number;
    public vertices: Float32Array;
    public indeices: Uint16Array;
}

class SkModelUtil {
    public static activeSubModel (model:Model, idx: number) {
        const attrs = vfmtPosUvColor;
        const stride = getAttributeStride(attrs);
        if (model.subModels.length <= idx) {
            const gfxDevice: Device = deviceManager.gfxDevice;
            const vertexBuffer = gfxDevice.createBuffer(new BufferInfo(
                BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST,
                MemoryUsageBit.DEVICE,
                65535 * stride,
                stride,
            ));
            const indexBuffer = gfxDevice.createBuffer(new BufferInfo(
                BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST,
                MemoryUsageBit.DEVICE,
                65535 * Uint16Array.BYTES_PER_ELEMENT * 2,
                Uint16Array.BYTES_PER_ELEMENT,
            ));
            const renderMesh = new RenderingSubMesh([vertexBuffer], attrs, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
            renderMesh.subMeshIdx = 0;

            const mat = builtinResMgr.get<Material>('default-spine2d-material');
            model.initSubModel(idx, renderMesh, mat);
            model.enabled = true;
        }
    }
}
