import { UIRenderable } from '../../2d';
import { IAssembler, IAssemblerManager } from '../../2d/renderer/base';

import { Batcher2D } from '../../2d/renderer/batcher-2d';
import { StaticVBAccessor } from '../../2d/renderer/static-vb-accessor';
import { vfmtPosUvColor4B, vfmtPosUvTwoColor4B } from '../../2d/renderer/vertex-format';
import { Skeleton, SpineMaterialType } from '../skeleton';
import { BlendFactor } from '../../gfx';
import { legacyCC } from '../../core/global-exports';
import { RenderData } from '../../2d/renderer/render-data';
import { director } from '../../game';
import spinex from '../lib/spine-core-x.js';

let _accessor: StaticVBAccessor = null!;
let _tintAccessor: StaticVBAccessor = null!;

let _premultipliedAlpha = false;
let _useTint = false;

function _getSlotMaterial (blendMode: number, comp: Skeleton) {
    let src: BlendFactor;
    let dst: BlendFactor;
    switch (blendMode) {
    case 1:
        src =  _premultipliedAlpha ? BlendFactor.ONE :  BlendFactor.SRC_ALPHA;
        dst = BlendFactor.ONE;
        break;
    case 2:
        src = BlendFactor.DST_COLOR;
        dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
        break;
    case 3:
        src = BlendFactor.ONE;
        dst = BlendFactor.ONE_MINUS_SRC_COLOR;
        break;
    case 0:
    default:
        src = _premultipliedAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
        dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
        break;
    }
    return comp.getMaterialForBlendAndTint(src, dst, _useTint ? SpineMaterialType.TWO_COLORED : SpineMaterialType.COLORED_TEXTURED);
}

export const simple: IAssembler = {
    fillBuffers (render: UIRenderable, batcher: Batcher2D) {

    },
    updateColor (render: UIRenderable) {

    },
    vCount: 32767,
    ensureAccessor (useTint: boolean) {
        let accessor = useTint ? _tintAccessor : _accessor;
        if (!accessor) {
            const device = director.root!.device;
            const batcher = director.root!.batcher2D;
            const attributes = useTint ? vfmtPosUvTwoColor4B : vfmtPosUvColor4B;
            if (useTint) {
                accessor = _tintAccessor = new StaticVBAccessor(device, attributes, this.vCount);
                // Register to batcher so that batcher can upload buffers after batching process
                batcher.registerBufferAccessor(Number.parseInt('SPINETINTX', 36), _tintAccessor);
            } else {
                accessor = _accessor = new StaticVBAccessor(device, attributes, this.vCount);
                // Register to batcher so that batcher can upload buffers after batching process
                batcher.registerBufferAccessor(Number.parseInt('SPINEX', 36), _accessor);
            }
        }
        return accessor;
    },

    createData (comp: Skeleton) {
        let rd = comp.renderData;
        if (!rd) {
            const useTint = comp.useTint;
            //const useTint = comp.useTint || comp.isAnimationCached();
            const accessor = this.ensureAccessor(useTint) as StaticVBAccessor;
            rd = RenderData.add(useTint ? vfmtPosUvTwoColor4B : vfmtPosUvColor4B, accessor);
            rd.resize(0, 0);
            if (!rd.indices) {
                rd.indices = new Uint16Array(0);
            }
        }
        return rd;
    },

    updateRenderData (comp: Skeleton, batcher: Batcher2D) {
        const skeleton = comp._skeleton;
        if (skeleton) {
            updateComponentRenderData(comp, batcher);
        }
    },
};

function updateComponentRenderData (comp: Skeleton, batcher: Batcher2D) {
    _premultipliedAlpha = comp.premultipliedAlpha;
    _useTint = comp.useTint;

    const floatStride = _useTint ? 7 : 6;

    comp.drawList.reset();
    const model = comp.updateRenderData();
    const vc = model.vCount;
    const ic = model.iCount;
    const rd = comp.renderData!;
    rd.resize(vc, ic);
    rd.indices = new Uint16Array(ic);
    const vbuf = rd.chunk.vb;
    const vUint8Buf = new Uint8Array(vbuf.buffer, vbuf.byteOffset, 4 * vbuf.length);

    const vPtr = model.vPtr;
    const vLength = vc * 4 * floatStride;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const vData = spinex.SkeletonInstance.HEAPU8.subarray(vPtr, vPtr + vLength);
    vUint8Buf.set(vData);

    const iPtr = model.iPtr;
    const ibuf = rd.indices;
    const iLength = 2 * ic;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const iData = spinex.SkeletonInstance.HEAPU8.subarray(iPtr, iPtr + iLength);
    const iUint8Buf = new Uint8Array(ibuf.buffer);
    iUint8Buf.set(iData);
    const chunkOffset = rd.chunk.vertexOffset;
    for (let i = 0; i < ic; i++) {
        rd.indices[i] += chunkOffset;
    }

    const meshes = model.getMeshes();
    const count = meshes.size();
    let indexOffset = 0;
    let indexCount = 0;
    for (let i = 0; i < count; i++) {
        const mesh = meshes.get(i);
        const material = _getSlotMaterial(mesh.blendMode, comp);
        indexCount = mesh.iCount;
        comp.requestDrawData(material, indexOffset, indexCount);
        indexOffset += indexCount;
    }
    const accessor = _useTint ? _tintAccessor : _accessor;
    accessor.getMeshBuffer(rd.chunk.bufferId).setDirty();
}

legacyCC.internal.SpineAssembler = simple;
