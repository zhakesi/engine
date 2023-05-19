import { UIRenderable } from '../../2d';
import { IAssembler, IAssemblerManager } from '../../2d/renderer/base';

import { Batcher2D } from '../../2d/renderer/batcher-2d';
import { StaticVBAccessor } from '../../2d/renderer/static-vb-accessor';
import { FrameColor } from '../skeleton-cache';
import { MaterialInstance } from '../../render-scene';
import { SkeletonTexture } from '../skeleton-texture';
import { getAttributeStride, vfmtPosUvColor4B, vfmtPosUvTwoColor4B } from '../../2d/renderer/vertex-format';
import { Skeleton, SpineMaterialType } from '../skeleton';
import { Color, Mat4, Vec3 } from '../../core';
import { BlendFactor } from '../../gfx';
import { legacyCC } from '../../core/global-exports';
import { RenderData } from '../../2d/renderer/render-data';
import { Texture2D } from '../../asset/assets/texture-2d';
import { director } from '../../game';

import { SpineSkeleton } from './spine-skeleton';
import { spineX } from './spine-define';

let _accessor: StaticVBAccessor = null!;
let _tintAccessor: StaticVBAccessor = null!;

const simple: IAssembler = {
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

    createData (comp: SpineSkeleton) {
        let rd = comp.renderData;
        if (!rd) {
            const useTint = false;
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

    updateRenderData (comp: SpineSkeleton, batcher: Batcher2D) {
        const skeleton = comp._skeleton;
        if (skeleton) {
            updateComponentRenderData(comp, batcher);
        }
    },
};

function updateComponentRenderData (comp: SpineSkeleton, batcher: Batcher2D) {
    const model = comp.updateRenderData();
    const meshes = model.getMeshes();
    console.log(meshes.size());
    const vc = model.vCount;
    const ic = model.iCount;
    const rd = comp.renderData!;
    rd.resize(vc, ic);
    rd.indices = new Uint16Array(ic);
    const vbuf = rd.chunk.vb;
    const vUintBuf = new Uint8Array(vbuf.buffer, vbuf.byteOffset, 4 * vbuf.length);

    const vPtr = model.vPtr;
    const vLength = vc * 4 * 6;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const vData = spineX.HEAP8.subarray(vPtr, vPtr + vLength);
    vUintBuf.set(vData);

    // vUintBuf.set()
    // const ibuf = rd.indices!;
    // ibuf.set()
}

export const simpleSpineAssemblerManager: IAssemblerManager = {
    getAssembler () {
        return simple;
    },
};

SpineSkeleton.Assembler = simpleSpineAssemblerManager;
