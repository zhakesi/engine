/*
 Copyright (c) 2017-2020 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { JSB } from 'internal:constants';
import { Material } from '../../core/assets/material';
import { RenderingSubMesh } from '../../core/assets/rendering-sub-mesh';
import { Mesh } from '../assets/mesh';
import { Skeleton } from '../assets/skeleton';
import { AABB } from '../../core/geometry';
import { BufferUsageBit, MemoryUsageBit, DescriptorSet, Buffer, BufferInfo, Attribute, FormatFeatureBit, Format, Texture } from '../../core/gfx';
import { Mat4, Vec3 } from '../../core/math';
import { JOINT_UNIFORM_CAPACITY, UBOSkinning, UNIFORM_REALTIME_JOINT_TEXTURE_BINDING } from '../../core/pipeline/define';
import { Node } from '../../core/scene-graph/node';
import { ModelType } from '../../core/renderer/scene/model';
import { uploadJointData } from '../skeletal-animation/skeletal-animation-utils';
import { MorphModel } from './morph-model';
import { deleteTransform, getTransform, getWorldMatrix, IJointTransform } from '../../core/animation/skeletal-animation-utils';
import { BatchingSchemes, IMacroPatch, Pass, NativeJointInfo, NativeJointTransform, NativeSkinningModel  } from '../../core/renderer';
import { warnID } from '../../core/platform/debug';
import { ImageAsset, Texture2D, director } from '../../core';
import { PixelFormat } from '../../core/assets/asset-enum';

const uniformPatches: IMacroPatch[] = [
    { name: 'CC_USE_SKINNING', value: true },
    { name: 'CC_USE_REAL_TIME_JOINT_TEXTURE', value: false },
];
const texturePatches: IMacroPatch[] = [
    { name: 'CC_USE_SKINNING', value: true },
    { name: 'CC_USE_REAL_TIME_JOINT_TEXTURE', value: true },
];

function getRelevantBuffers (outIndices: number[], outBuffers: number[], jointMaps: number[][], targetJoint: number) {
    for (let i = 0; i < jointMaps.length; i++) {
        const idxMap = jointMaps[i];
        let index = -1;
        for (let j = 0; j < idxMap.length; j++) {
            if (idxMap[j] === targetJoint) { index = j; break; }
        }
        if (index >= 0) {
            outBuffers.push(i);
            outIndices.push(index);
        }
    }
}

interface IJointInfo {
    bound: AABB;
    target: Node;
    bindpose: Mat4;
    transform: IJointTransform;
    buffers: number[];
    indices: number[];
}

const v3_min = new Vec3();
const v3_max = new Vec3();
const v3_1 = new Vec3();
const v3_2 = new Vec3();
const m4_1 = new Mat4();
const ab_1 = new AABB();

class RealTimeJointTexture {
    public static readonly WIDTH = 256;
    public static readonly HEIGHT = 3;
    public _format = PixelFormat.RGBA32F; // default use float texture
    public _textures: Texture2D[] = [];
    public _buffers: Float32Array[] = [];
}

/**
 * @en
 * The skinning model that is using real-time pose calculation.
 * @zh
 * 实时计算动画的蒙皮模型。
 */
export class SkinningModel extends MorphModel {
    public uploadAnimation = null;

    private _buffers: Buffer[] = [];
    private _dataArray: Float32Array[] = [];
    private _joints: IJointInfo[] = [];
    private _bufferIndices: number[] | null = null;
    private _realTimeJointTexture = new RealTimeJointTexture();
    private _realTimeTextureModel = false;
    constructor () {
        super();
        this.type = ModelType.SKINNING;
    }

    protected _init () {
        if (JSB) {
            this._nativeObj = new NativeSkinningModel();
        }
    }

    public destroy () {
        this.bindSkeleton();
        if (this._buffers.length) {
            for (let i = 0; i < this._buffers.length; i++) {
                this._buffers[i].destroy();
            }
            this._buffers.length = 0;
        }
        super.destroy();
    }

    public bindSkeleton (skeleton: Skeleton | null = null, skinningRoot: Node | null = null, mesh: Mesh | null = null) {
        for (let i = 0; i < this._joints.length; i++) {
            deleteTransform(this._joints[i].target);
        }
        this._bufferIndices = null; this._joints.length = 0;
        if (!skeleton || !skinningRoot || !mesh) { return; }
        this.transform = skinningRoot;
        const boneSpaceBounds = mesh.getBoneSpaceBounds(skeleton);
        const jointMaps = mesh.struct.jointMaps;
        this._ensureEnoughBuffers(jointMaps && jointMaps.length || 1, skeleton.joints.length);
        this._bufferIndices = mesh.jointBufferIndices;
        const nativeJoints: NativeJointInfo[] = [];
        this._initRealTimeJointTexture(skeleton.joints.length);
        for (let index = 0; index < skeleton.joints.length; index++) {
            const bound = boneSpaceBounds[index];
            const target = skinningRoot.getChildByPath(skeleton.joints[index]);
            if (!bound || !target) { continue; }
            const transform = getTransform(target, skinningRoot)!;
            const bindpose = skeleton.bindposes[index];
            const indices: number[] = [];
            const buffers: number[] = [];
            if (!jointMaps) { indices.push(index); buffers.push(0); } else { getRelevantBuffers(indices, buffers, jointMaps, index); }
            this._joints.push({ indices, buffers, bound, target, bindpose, transform });
            if (JSB) {
                let currParent: IJointTransform | null | undefined = transform.parent;
                const transParents: NativeJointTransform[] = [];
                while (currParent) {
                    transParents.push({ node: currParent.node.native, local: currParent.local, world: currParent.local, stamp: currParent.stamp });
                    currParent = currParent.parent;
                }
                nativeJoints.push({ indices,
                    buffers,
                    bound: bound.native,
                    target: target.native,
                    bindpose,
                    transform: { node: transform.node.native, local: transform.local, world: transform.world, stamp: transform.stamp },
                    parents: transParents,
                });
            }
        }
        if (JSB) {
            (this._nativeObj! as NativeSkinningModel).setIndicesAndJoints(this._bufferIndices, nativeJoints);
        }
    }

    public updateTransform (stamp: number) {
        const root = this.transform;
        // @ts-expect-error TS2445
        if (root.hasChangedFlags || root._dirtyFlags) {
            root.updateWorldTransform();
            this._localDataUpdated = true;
        }
        // update bounds
        Vec3.set(v3_min,  Infinity,  Infinity,  Infinity);
        Vec3.set(v3_max, -Infinity, -Infinity, -Infinity);
        for (let i = 0; i < this._joints.length; i++) {
            const { bound, transform } = this._joints[i];
            const worldMatrix = getWorldMatrix(transform, stamp);
            AABB.transform(ab_1, bound, worldMatrix);
            ab_1.getBoundary(v3_1, v3_2);
            Vec3.min(v3_min, v3_min, v3_1);
            Vec3.max(v3_max, v3_max, v3_2);
        }
        const worldBounds = this._worldBounds;
        if (this._modelBounds && worldBounds) {
            AABB.fromPoints(this._modelBounds, v3_min, v3_max);
            // @ts-expect-error TS2445
            this._modelBounds.transform(root._mat, root._pos, root._rot, root._scale, this._worldBounds);
            this._updateNativeBounds();
        }
    }

    public updateUBOs (stamp: number) {
        super.updateUBOs(stamp);
        for (let i = 0; i < this._joints.length; i++) {
            const { indices, buffers, transform, bindpose } = this._joints[i];
            Mat4.multiply(m4_1, transform.world, bindpose);
            for (let b = 0; b < buffers.length; b++) {
                uploadJointData(this._dataArray[buffers[b]], indices[b] * 12, m4_1, i === 0);
            }
        }
        if (this._realTimeTextureModel === false) {
            for (let b = 0; b < this._buffers.length; b++) {
                this._buffers[b].update(this._dataArray[b]);
            }
        } else {
            this._updateRealTimeJointTextureBuffer();
        }
        return true;
    }

    public initSubModel (idx: number, subMeshData: RenderingSubMesh, mat: Material) {
        const original = subMeshData.vertexBuffers;
        const iaInfo = subMeshData.iaInfo;
        iaInfo.vertexBuffers = subMeshData.jointMappedBuffers;
        super.initSubModel(idx, subMeshData, mat);
        iaInfo.vertexBuffers = original;
    }

    public getMacroPatches (subModelIndex: number): IMacroPatch[] | null {
        const superMacroPatches = super.getMacroPatches(subModelIndex);
        let myPatches = uniformPatches;
        if (this._realTimeTextureModel) {
            myPatches = texturePatches;
        }
        if (superMacroPatches) {
            return myPatches.concat(superMacroPatches);
        }
        return myPatches;
    }

    /**
     * @deprecated since v3.5.0, this is an engine private interface that will be removed in the future.
     */
    public _updateLocalDescriptors (submodelIdx: number, descriptorSet: DescriptorSet) {
        super._updateLocalDescriptors(submodelIdx, descriptorSet);
        if (JSB) {
            (this._nativeObj! as NativeSkinningModel).updateLocalDescriptors(submodelIdx, descriptorSet);
            return;
        }
        const idx = this._bufferIndices![submodelIdx];
        const buffer = this._buffers[idx];
        if (buffer) { descriptorSet.bindBuffer(UBOSkinning.BINDING, buffer); }
        this._bindRealTimeJointTexture(idx, descriptorSet);
    }

    protected _updateInstancedAttributes (attributes: Attribute[], pass: Pass) {
        if (pass.batchingScheme !== BatchingSchemes.NONE) {
            // TODO(holycanvas): #9203 better to print the complete path instead of only the current node
            warnID(3936, this.node.getPathInHierarchy());
        }
        super._updateInstancedAttributes(attributes, pass);
    }

    private _ensureEnoughBuffers (count: number, jointCount : number) {
        for (let i = 0; i < count; i++) {
            if (!this._buffers[i]) {
                this._buffers[i] = this._device.createBuffer(new BufferInfo(
                    BufferUsageBit.UNIFORM | BufferUsageBit.TRANSFER_DST,
                    MemoryUsageBit.HOST | MemoryUsageBit.DEVICE,
                    UBOSkinning.SIZE,
                    UBOSkinning.SIZE,
                ));
            }
            if (!this._dataArray[i]) {
                let maxJoints = JOINT_UNIFORM_CAPACITY;
                if (jointCount > JOINT_UNIFORM_CAPACITY) {
                    maxJoints = RealTimeJointTexture.WIDTH;
                }
                this._dataArray[i] = new Float32Array(12 * maxJoints);
            }
        }
        if (JSB) {
            (this._nativeObj! as NativeSkinningModel).setBuffers(this._buffers);
        }
    }

    private _initRealTimeJointTexture (jointCount: number) {
        //if (gfxDevice.capabilities.maxSkinningJoints < jointCount)
        if (JOINT_UNIFORM_CAPACITY < jointCount) {
            this._realTimeTextureModel = true;
        }
        if (!this._realTimeTextureModel) return;

        const gfxDevice = director.root!.device;
        let width = RealTimeJointTexture.WIDTH;
        const height = RealTimeJointTexture.HEIGHT;
        const hasFeatureFloatTexture = gfxDevice.getFormatFeatures(Format.RGBA32F) & FormatFeatureBit.SAMPLED_TEXTURE;
        if (hasFeatureFloatTexture === 0) {
            this._realTimeJointTexture._format = PixelFormat.RGBA8888;
            width = 4 * RealTimeJointTexture.WIDTH;
        }

        const textures = this._realTimeJointTexture._textures;
        const buffers = this._realTimeJointTexture._buffers;
        const pixelFormat = this._realTimeJointTexture._format;
        for (let i = 0; i < this._dataArray.length; i++) {
            buffers[i] = new Float32Array(4 * RealTimeJointTexture.HEIGHT * RealTimeJointTexture.WIDTH);
            const arrayBuffer = buffers[i];
            const updateView =  pixelFormat === PixelFormat.RGBA32F ? arrayBuffer : new Uint8Array(arrayBuffer.buffer);
            const image = new ImageAsset({
                width,
                height,
                _data: updateView,
                _compressed: false,
                format: pixelFormat,
            });
            const texture = new Texture2D();
            texture.setFilters(Texture2D.Filter.NEAREST, Texture2D.Filter.NEAREST);
            texture.setMipFilter(Texture2D.Filter.NONE);
            texture.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);
            texture.image = image;
            textures[i] = texture;
        }
        if (JSB) {
            const gfxTextures: Texture[] = [];
            for (let i = 0; i < textures.length; i++) {
                gfxTextures.push(textures[i].getGFXTexture()!);
            }
            (this._nativeObj! as NativeSkinningModel).setRealTimeJointTextures(gfxTextures);
        }
    }

    private _bindRealTimeJointTexture (idx: number, descriptorSet: DescriptorSet) {
        if (!this._realTimeTextureModel) return;
        const jointTexture = this._realTimeJointTexture._textures[idx];
        if (jointTexture) {
            const gfxTexture = jointTexture.getGFXTexture();
            const sampler = jointTexture.getGFXSampler();
            descriptorSet.bindTexture(UNIFORM_REALTIME_JOINT_TEXTURE_BINDING, gfxTexture!);
            descriptorSet.bindSampler(UNIFORM_REALTIME_JOINT_TEXTURE_BINDING, sampler);
        }
    }

    private _updateRealTimeJointTextureBuffer () {
        if (!this._realTimeTextureModel) return;
        const textures = this._realTimeJointTexture._textures;
        const buffers = this._realTimeJointTexture._buffers;
        for (let idx = 0; idx < textures.length; idx++) {
            const arrayBuffer = buffers[idx];
            const src = this._dataArray[idx];
            const count = src.length / 12; // mat3x4
            let idxSrc = 0;
            let idxDst = 0;
            for (let i = 0; i < count; i++) {
                idxDst = 4 * i;
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                idxDst = 4 * (i + RealTimeJointTexture.WIDTH);
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                idxDst = 4 * (i + 2 * RealTimeJointTexture.WIDTH);
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
                arrayBuffer[idxDst++] = src[idxSrc++];
            }
            const pixelFormat = this._realTimeJointTexture._format;
            const updateView = pixelFormat === PixelFormat.RGBA32F ? arrayBuffer : new Uint8Array(arrayBuffer.buffer);
            textures[idx].uploadData(updateView);
        }
    }
}
