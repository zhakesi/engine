/*
 Copyright (c) 2020-2022 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

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

import { ccclass, executeInEditMode, executionOrder, help, menu, serializable, type, visible } from 'cc.decorator';
import { EDITOR } from 'internal:constants';
import { builtinResMgr, Color, Material, ModelRenderer, ccenum, Enum, CCClass, Texture2D } from '../../core';
import { legacyCC } from '../../core/global-exports';
import { ModelLocalBindings } from '../../core/pipeline/define';
import { Model } from '../../core/renderer/scene';
import { Root } from '../../core/root';
import { TransformBit } from '../../core/scene-graph/node-enum';
import { SkeletonData } from '../skeleton-data';
import { editable, displayName,  tooltip } from '../../core/data/decorators';
import { RenderingSubMesh } from '../../core/assets';
import { Format, PrimitiveMode, Attribute, Device, BufferUsageBit, BufferInfo, MemoryUsageBit, deviceManager } from '../../core/gfx';
import { vfmtPosUvColor, getAttributeStride, getComponentPerVertex, vfmtPosUvTwoColor } from '../../2d/renderer/vertex-format';
import spine from '../lib/spine-core.js';
import { SkeletonTexture } from '../skeleton-texture';

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

enum DefaultSkinsEnum {
    default = 0,
}
ccenum(DefaultSkinsEnum);

enum DefaultAnimsEnum {
    '<None>' = 0
}
ccenum(DefaultAnimsEnum);

function setEnumAttr (obj, propName, enumDef) {
    CCClass.Attr.setClassAttr(obj, propName, 'type', 'Enum');
    CCClass.Attr.setClassAttr(obj, propName, 'enumList', Enum.getList(enumDef));
}

const DATA_SETTING = 0x3;
const SKIN_SETTING = 0x1;
const ANIMATION_SETTING = 0x2;

class SlotDraw {
    constructor (idx:number, vb:Float32Array, ib: number[],
        blend: spine.BlendMode, tex: SkeletonTexture) {
        this.idx = idx;
        this.vb = vb;
        this.ib = ib;
        this.blend = blend;
        this.texture = tex;
    }
    public idx;
    public vb: Float32Array;
    public ib: number[]
    public blend: spine.BlendMode;
    public texture: SkeletonTexture;
}

@ccclass('cc.Skeleton2DRenderer')
@help('i18n:cc.Skeleton2DRenderer')
@executionOrder(100)
@menu('2D/Skeleton2DRenderer')
@executeInEditMode
export class Skeleton2DRenderer extends ModelRenderer {
    @serializable
    protected _skeletonData: SkeletonData | null = null;
    /**
     * @en
     * The name of default skin.
     * @zh
     * 默认的皮肤名称。
     */
    @serializable
    @visible(false)
    protected _defaultSkin = '';
    protected _defaultSkinIndex = 0;

    /**
     * @en
     * The name of default animation.
     * @zh
     * 默认的动画名称。
     * @property {String} _defaultAnimation
     */
    @visible(false)
    @serializable
    protected _defaultAnimation = '';

    protected _animationName = '<None>';
    protected _settingState = 0;
    protected _animationIndex = 0;

    protected _premultipliedAlpha = false;
    protected _useTint = false;

    protected _skeleton: spine.Skeleton | null = null;
    protected _clipper: spine.SkeletonClipping | null = null;
    protected _animState: spine.AnimationState | null = null;

    protected _pixelsToUnits = 0.01;
    protected _zOffset = 1;
    protected _textures: Texture2D[] = [];

    private _tmpFinalColor = new spine.Color();
    private _tmpDarkColor = new spine.Color();
    protected _vertexEffect: spine.VertexEffect | null = null;

    /**
     * @en
     * The skeleton data contains the skeleton information (bind pose bones, slots, draw order,
     * attachments, skins, etc) and animations but does not hold any state.<br/>
     * Multiple skeletons can share the same skeleton data.
     * @zh
     * 骨骼数据包含了骨骼信息（绑定骨骼动作，slots，渲染顺序，
     * attachments，皮肤等等）和动画但不持有任何状态。<br/>
     * 多个 Skeleton 可以共用相同的骨骼数据。
     */
    @editable
    @type(SkeletonData)
    get skeletonData () {
        return this._skeletonData;
    }
    set skeletonData (value: SkeletonData | null) {
        this._skeletonData = value;
        this._settingState |= DATA_SETTING;
        this._updateComponentRenderData();
    }

    /**
     * @internal
     */
    @displayName('Default Skin')
    @type(DefaultSkinsEnum)
    @tooltip('i18n:COMPONENT.skeleton.default_skin')
    get defaultSkinIndex (): number {
        if (this.skeletonData) {
            const skinsEnum = this.skeletonData.getSkinsEnum();
            if (skinsEnum) {
                if (this._defaultSkin === '') {
                    // eslint-disable-next-line no-prototype-builtins
                    if (skinsEnum.hasOwnProperty(0)) {
                        this._defaultSkinIndex = 0;
                        return 0;
                    }
                } else {
                    const skinIndex = skinsEnum[this._defaultSkin];
                    if (skinIndex !== undefined) {
                        return skinIndex;
                    }
                }
            }
        }
        return 0;
    }
    set defaultSkinIndex (value: number) {
        let skinsEnum;
        if (this.skeletonData) {
            skinsEnum = this.skeletonData.getSkinsEnum();
        }
        if (!skinsEnum) {
            console.error(`${this.name} skin enums are invalid`);
            return;
        }

        const skinName = skinsEnum[value];
        if (skinName !== undefined) {
            this._defaultSkin = skinName;
            console.log(`set skinName:${skinName}`);
        } else {
            console.error(`${this.name} skin enums are invalid`);
        }
        this._settingState |= SKIN_SETTING;
        this._updateComponentRenderData();
    }

    /**
     * @en The name of current playing animation.
     * @zh 当前播放的动画名称。
     * @property {String} animation
     */
    get animation (): string {
        return this._animationName;
    }
    set animation (value: string) {
        this._animationName = value;
    }

    /**
     * @internal
     */
    @displayName('Animation Name')
    @type(DefaultAnimsEnum)
    get animationIndex () {
        return this._animationIndex;
    }
    set animationIndex (value: number) {
        this._animationIndex = value;
        this._settingState |= ANIMATION_SETTING;
        this._updateComponentRenderData();
    }
    // update animation list for editor
    protected _updateAnimEnum () {
        if (!EDITOR) return;
        let animEnum;
        if (this.skeletonData) {
            animEnum = this.skeletonData.getAnimsEnum();
        } else {
            animEnum = DefaultAnimsEnum;
        }
        // reset enum type
        const enumAnimations = Enum({});
        Object.assign(enumAnimations, animEnum);
        Enum.update(enumAnimations);
        setEnumAttr(this, 'animationIndex', enumAnimations);
        const animName = animEnum[this._animationIndex];
        if (animName !== undefined) {
            this._defaultAnimation = animName;
            this._animationName = animName;
        } else {
            console.error(`${this.name} animation enums are invalid`);
        }
    }
    // update skin list for editor
    protected _updateSkinEnum () {
        if (!EDITOR) return;
        let skinEnum;
        if (this.skeletonData) {
            skinEnum = this.skeletonData.getSkinsEnum();
        } else {
            skinEnum = DefaultSkinsEnum;
        }
        const enumSkins = Enum({});
        Object.assign(enumSkins, skinEnum);
        Enum.update(enumSkins);
        setEnumAttr(this, 'defaultSkinIndex', enumSkins);
    }

    get premultipliedAlpha () {
        return this._premultipliedAlpha;
    }
    set premultipliedAlpha (val) {
        this._premultipliedAlpha = val;
    }

    get useTint () {
        return this._useTint;
    }
    set useTint (val) {
        this._useTint = val;
    }

    // public __preload () {
    // }

    public onLoad () {
        if (this._models.length < 1) {
            this._createModel();
        }
    }

    public onRestore () {
    }

    public update (dt: number) {
        if (!this._skeleton) return;
        this._skeleton.update(dt);
        if (this._animState) {
            this._animState.update(dt);
            this._animState.apply(this._skeleton);
        }
        this.realTimeTraverse();
        this._onUpdateLocalDescriptorSet();
    }

    public onEnable () {
        this._attachToScene();
        if (!this._skeletonData) return;
        this._settingState |= DATA_SETTING;
        this._updateComponentRenderData();
    }

    public onDisable () {
        this._detachFromScene();
    }

    public onDestroy () {
        if (this._models.length > 0) {
            legacyCC.director.root.destroyModel(this._models[0]);
            this._models.length = 0;
        }
    }

    protected _createModel () {
        const model = (legacyCC.director.root as Root).createModel<Model>(Model);
        this._models[0] = model;
        model.visFlags = this.visibility;
        model.node = model.transform = this.node;
    }

    protected _attachToScene () {
        if (!this.node.scene || this._models.length < 1) {
            return;
        }
        const renderScene = this._getRenderScene();
        if (this._models[0].scene !== null) {
            this._detachFromScene();
        }
        renderScene.addModel(this._models[0]);
    }

    protected _detachFromScene () {
        if (this._models.length > 0 && this._models[0].scene) {
            this._models[0].scene.removeModel(this._models[0]);
        }
    }

    public _activeSubModel (idx: number) {
        if (this._models.length < 1) {
            return;
        }
        let attrs = vfmtPosUvColor;
        if (this.useTint) {
            attrs = vfmtPosUvTwoColor;
        }
        const stride = getAttributeStride(attrs);

        if (this._models[0].subModels.length <= idx) {
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
            this._models[0].initSubModel(idx, renderMesh, mat);
            this._models[0].enabled = true;
        }
    }

    protected _onUpdateLocalDescriptorSet () {
        const subModels = this._models[0].subModels;
        const binding = ModelLocalBindings.SAMPLER_SPRITE;
        for (let i = 0; i < subModels.length; i++) {
            const { descriptorSet } = subModels[i];
            const texture = this._textures[i];
            descriptorSet.bindTexture(binding, texture.getGFXTexture()!);
            descriptorSet.bindSampler(binding, texture.getGFXSampler()!);
            descriptorSet.update();
        }
    }

    protected _updateSkeletonData () {
        const runtimeData = this._skeletonData!.getRuntimeData();
        if (!runtimeData) {
            return;
        }
        this._skeleton = new spine.Skeleton(runtimeData);
        this._clipper = new spine.SkeletonClipping();
        const stateData = new spine.AnimationStateData(runtimeData);
        this._animState = new spine.AnimationState(stateData);

        this._animationName = this._defaultAnimation;
    }

    protected _updateSkin () {
        if (!this._skeleton) return;
        if (this._defaultSkin !== '') {
            this._skeleton.setSkinByName(this._defaultSkin);
        }
        this._skeleton.setSlotsToSetupPose();
    }
    protected _updateAnimation () {
        if (this._animationName === '<None>' || this._animationName === '') return;
        this.setAnimation(0, this._animationName, true);
    }

    public setAnimation (trackIndex: number, name: string, loop: boolean) {
        if (this._skeleton) {
            const animation = this._skeleton.data.findAnimation(name);
            if (!animation) {
                return;
            }
            console.log(`setAnimation${this._animationName}`);
            this._animState!.setAnimationWith(trackIndex, animation, loop);
            this._animState!.apply(this._skeleton);
        }
    }

    protected _updateComponentRenderData () {
        if (this._settingState & DATA_SETTING) {
            this._updateSkeletonData();
        }
        if (this._settingState & SKIN_SETTING) {
            this._updateSkinEnum();
            this._updateSkin();
            this._settingState &= ~SKIN_SETTING;
        }
        if (this._settingState & ANIMATION_SETTING) {
            this._updateAnimEnum();
            this._updateAnimation();
            this._settingState &= ~ANIMATION_SETTING;
        }
        this.realTimeTraverse();
        this._onUpdateLocalDescriptorSet();
    }

    protected computeFinalColor (slotColor:spine.Color, attachmentColor: spine.Color) {
        const finalColor = this._tmpFinalColor;
        const skeletonColor = this._skeleton!.color;
        finalColor.r = skeletonColor.r * slotColor.r * attachmentColor.r;
        finalColor.g = skeletonColor.g * slotColor.g * attachmentColor.g;
        finalColor.b = skeletonColor.b * slotColor.b * attachmentColor.b;
        finalColor.a = skeletonColor.a * slotColor.a * attachmentColor.a;
        if (this.premultipliedAlpha) {
            finalColor.r *= finalColor.a;
            finalColor.g *= finalColor.a;
            finalColor.b *= finalColor.a;
        }
    }

    public computeDarkColor (slot: spine.Slot) {
        const darkColor = this._tmpDarkColor;
        const finalColor = this._tmpFinalColor;
        if (!slot.darkColor) {
            darkColor.set(0, 0, 0, 1.0);
        } else {
            if (this.premultipliedAlpha) {
                darkColor.r = slot.darkColor.r * finalColor.a;
                darkColor.g = slot.darkColor.g * finalColor.a;
                darkColor.b = slot.darkColor.b * finalColor.a;
            } else {
                darkColor.setFromColor(slot.darkColor);
            }
            darkColor.a = this.premultipliedAlpha ? 1.0 : 0.0;
        }
    }

    protected realTimeTraverse () {
        if (!this._skeleton) return;
        this._skeleton.updateWorldTransform();

        const twoColorTint = this._useTint;
        const slotCount = this._skeleton.drawOrder.length;
        const clipper = this._clipper!;
        const zOffset = this._zOffset;

        let uvs:ArrayLike<number>;
        let triangles: number[];
        let tempZ = 0;
        const tempPos = new spine.Vector2();
        const tempUv = new spine.Vector2();
        const tempLight = new spine.Color();
        const tempDark = new spine.Color();
        let tempDrawCount = 0;
        let tempDraw: SlotDraw;
        const slotRangeStart = -1;
        const slotRangeEnd = -1;
        const vertexSize = twoColorTint ? 13 : 9;
        let inRange = false;
        if (slotRangeStart === -1) inRange = true;

        for (let slotIdx = 0; slotIdx < slotCount; slotIdx++) {
            const slot = this._skeleton.drawOrder[slotIdx];
            const clippedVertexSize = clipper.isClipping() ? 2 : vertexSize;
            if (!slot.bone.active) {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (slotRangeStart >= 0 && slotRangeStart === slot.data.index) {
                inRange = true;
            }

            if (!inRange) {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (slotRangeEnd >= 0 && slotRangeEnd === slot.data.index) {
                inRange = false;
            }

            let vertices: Float32Array;
            let texture : SkeletonTexture | null = null;
            let numFloats = 0;
            let numVertices = 0;
            const attachment = slot.getAttachment();
            if (attachment instanceof spine.RegionAttachment) {
                numVertices = 4;
                numFloats = vertexSize * numVertices;
                vertices = new Float32Array(numFloats);
                attachment.computeWorldVertices(slot.bone, vertices, 0, clippedVertexSize);
                triangles = QUAD_TRIANGLES;
                uvs = attachment.uvs;
                texture = (attachment.region.renderObject).page.texture as SkeletonTexture;
            } else if (attachment instanceof spine.MeshAttachment) {
                numVertices = attachment.worldVerticesLength >> 1;
                numFloats = numVertices * vertexSize;
                vertices = new Float32Array(numFloats);
                attachment.computeWorldVertices(slot, 0, attachment.worldVerticesLength, vertices, 0, clippedVertexSize);
                triangles = attachment.triangles;
                texture = (attachment.region.renderObject).page.texture as SkeletonTexture;
                uvs = attachment.uvs;
            } else if (attachment instanceof spine.ClippingAttachment) {
                clipper.clipStart(slot, attachment);
                continue;
            } else {
                clipper.clipEndWithSlot(slot);
                continue;
            }
            if (texture) {
                const pixelsToUnits = this._pixelsToUnits;
                const finalColor = this._tmpFinalColor;
                const darkColor = this._tmpDarkColor;
                this.computeFinalColor(slot.color, attachment.color);
                this.computeDarkColor(slot);

                const blendMode = slot.data.blendMode;

                if (clipper.isClipping()) {
                    clipper.clipTriangles(vertices, numFloats, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);
                    const clippedVertices = new Float32Array(clipper.clippedVertices);
                    const clippedTriangles = clipper.clippedTriangles;
                    if (this._vertexEffect) {
                        const verts = clippedVertices;
                        const vertexEffect = this._vertexEffect;
                        if (!twoColorTint) {
                            tempDark.set(0, 0, 0, 0);
                            for (let v = 0, n = clippedVertices.length; v < n; v += vertexSize) {
                                tempPos.x = verts[v];
                                tempPos.y = verts[v + 1];
                                tempLight.set(verts[v + 2], verts[v + 3], verts[v + 4], verts[v + 5]);
                                tempUv.x = verts[v + 6];
                                tempUv.y = verts[v + 7];
                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
                                verts[v] = tempPos.x * pixelsToUnits;
                                verts[v + 1] = tempPos.y * pixelsToUnits;
                                verts[v + 2] = tempZ * pixelsToUnits;
                                verts[v + 3] = tempUv.x;
                                verts[v + 4] = tempUv.y;
                                verts[v + 5] = tempLight.r;
                                verts[v + 6] = tempLight.g;
                                verts[v + 7] = tempLight.b;
                                verts[v + 8] = tempLight.a;
                            }
                        } else {
                            for (let v = 0, n = clippedVertices.length; v < n; v += vertexSize) {
                                tempPos.x = verts[v];
                                tempPos.y = verts[v + 1];
                                tempLight.set(verts[v + 2], verts[v + 3], verts[v + 4], verts[v + 5]);
                                tempUv.x = verts[v + 6];
                                tempUv.y = verts[v + 7];
                                tempDark.set(verts[v + 8], verts[v + 9], verts[v + 10], verts[v + 11]);
                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
                                verts[v] = tempPos.x * pixelsToUnits;
                                verts[v + 1] = tempPos.y * pixelsToUnits;
                                verts[v + 2] = tempZ * pixelsToUnits;
                                verts[v + 3] = tempUv.x;
                                verts[v + 4] = tempUv.y;
                                verts[v + 5] = tempLight.r;
                                verts[v + 6] = tempLight.g;
                                verts[v + 7] = tempLight.b;
                                verts[v + 8] = tempLight.a;
                                verts[v + 9] = tempDark.r;
                                verts[v + 10] = tempDark.g;
                                verts[v + 11] = tempDark.b;
                                verts[v + 12] = tempDark.a;
                            }
                        }
                    }
                    tempDraw = new SlotDraw(tempDrawCount, clippedVertices,
                        clippedTriangles, blendMode, texture);
                    this.addDrawData(tempDraw);
                    tempDrawCount++;
                    tempZ += zOffset;
                } else {
                    const verts = vertices;
                    if (this._vertexEffect) {
                        const vertexEffect = this._vertexEffect;
                        if (!twoColorTint) {
                            for (let v = 0, u = 0, n = numFloats; v < n; v += vertexSize, u += 2) {
                                tempPos.x = verts[v];
                                tempPos.y = verts[v + 1];
                                tempUv.x = uvs[u];
                                tempUv.y = uvs[u + 1];
                                tempLight.setFromColor(finalColor);
                                tempDark.set(0, 0, 0, 0);
                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
                                verts[v] = tempPos.x * pixelsToUnits;
                                verts[v + 1] = tempPos.y * pixelsToUnits;
                                verts[v + 2] = tempZ * pixelsToUnits;
                                verts[v + 3] = tempUv.x;
                                verts[v + 4] = tempUv.y;
                                verts[v + 5] = tempLight.r;
                                verts[v + 6] = tempLight.g;
                                verts[v + 7] = tempLight.b;
                                verts[v + 8] = tempLight.a;
                            }
                        } else {
                            const verts = vertices;
                            for (let v = 0, u = 0, n = numFloats; v < n; v += vertexSize, u += 2) {
                                tempPos.x = verts[v];
                                tempPos.y = verts[v + 1];
                                tempUv.x = uvs[u];
                                tempUv.y = uvs[u + 1];
                                tempLight.setFromColor(finalColor);
                                tempDark.setFromColor(darkColor);
                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
                                verts[v] = tempPos.x * pixelsToUnits;
                                verts[v + 1] = tempPos.y * pixelsToUnits;
                                verts[v + 2] = tempZ * pixelsToUnits;
                                verts[v + 3] = tempUv.x;
                                verts[v + 4] = tempUv.y;
                                verts[v + 5] = tempLight.r;
                                verts[v + 6] = tempLight.g;
                                verts[v + 7] = tempLight.b;
                                verts[v + 8] = tempLight.a;
                                verts[v + 9] = tempDark.r;
                                verts[v + 10] = tempDark.g;
                                verts[v + 11] = tempDark.b;
                                verts[v + 12] = tempDark.a;
                            }
                        }
                    } else if (!twoColorTint) {
                        for (let v = 0, u = 0, n = numFloats; v < n; v += vertexSize, u += 2) {
                            verts[v] *= pixelsToUnits;
                            verts[v + 1] *= pixelsToUnits;
                            verts[v + 2] = tempZ * pixelsToUnits;
                            verts[v + 3] = uvs[u];
                            verts[v + 4] = uvs[u + 1];
                            verts[v + 5] = finalColor.r;
                            verts[v + 6] = finalColor.g;
                            verts[v + 7] = finalColor.b;
                            verts[v + 8] = finalColor.a;
                        }
                    } else {
                        for (let v = 0, u = 0, n = numFloats; v < n; v += vertexSize, u += 2) {
                            verts[v] *= pixelsToUnits;
                            verts[v + 1] *= pixelsToUnits;
                            verts[v + 2] = tempZ * pixelsToUnits;
                            verts[v + 3] = uvs[u];
                            verts[v + 4] = uvs[u + 1];
                            verts[v + 5] = finalColor.r;
                            verts[v + 6] = finalColor.g;
                            verts[v + 7] = finalColor.b;
                            verts[v + 8] = finalColor.a;
                            verts[v + 9] = darkColor.r;
                            verts[v + 10] = darkColor.g;
                            verts[v + 11] = darkColor.b;
                            verts[v + 12] = darkColor.a;
                        }
                    }
                    tempDraw = new SlotDraw(tempDrawCount, vertices,
                        triangles, blendMode, texture);
                    this.addDrawData(tempDraw);
                    tempDrawCount++;
                    tempZ += zOffset;
                }
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();
        this._models[0].subModels.length = tempDrawCount;
    }

    protected addDrawData (draw: SlotDraw) {
        const vb = draw.vb;
        const indices = draw.ib;
        const tex = draw.texture.getRealTexture();
        const idx = draw.idx;

        this._textures[idx] = tex!;

        this._activeSubModel(idx);
        const subModel = this._models[0].subModels[idx];
        const ia = subModel.inputAssembler;
        ia.vertexBuffers[0].update(vb);
        ia.vertexCount = vb.length / 9;
        const ib = new Uint16Array(indices);
        ia.indexBuffer!.update(ib);
        ia.indexCount = ib.length;
    }
}
