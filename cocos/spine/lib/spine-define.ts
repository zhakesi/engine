import spinex from './spine-core-x.js';
import { js } from '../../core';

function overrideClass (wasm) {
    //spinex.Vector2 = wasm.Vector2;
    spinex.MathUtils = wasm.MathUtils;
    spinex.Color = wasm.Color;
    spinex.Interpolation = wasm.Interpolation;
    spinex.Triangulator = wasm.Triangulator;
    spinex.ConstraintData = wasm.ConstraintData;
    spinex.IkConstraintData = wasm.PathConstraintData;
    spinex.PathConstraintData = wasm.PathConstraintData;
    spinex.SkeletonBounds = wasm.SkeletonBounds;
    spinex.Event = wasm.Event;
    spinex.EventData = wasm.EventData;
    spinex.Attachment = wasm.Attachment;
    spinex.VertexAttachment = wasm.VertexAttachment;
    spinex.BoundingBoxAttachment = wasm.BoundingBoxAttachment;
    spinex.ClippingAttachment = wasm.ClippingAttachment;
    spinex.MeshAttachment = wasm.MeshAttachment;
    spinex.PathAttachment = wasm.PathAttachment;
    spinex.PointAttachment = wasm.PointAttachment;
    spinex.RegionAttachment = wasm.RegionAttachment;
    spinex.AtlasAttachmentLoader = wasm.AtlasAttachmentLoader;
    spinex.TextureAtlasPage = wasm.TextureAtlasPage;
    spinex.TextureAtlasRegion = wasm.TextureAtlasRegion;
    spinex.TextureAtlas = wasm.TextureAtlas;
    spinex.PowOut = wasm.PowOut;
    spinex.BoneData = wasm.BoneData;
    spinex.SlotData = wasm.SlotData;
    spinex.Updatable = wasm.Updatable;
    spinex.IkConstraint = wasm.IkConstraint;
    spinex.PathConstraint = wasm.PathConstraint;
    spinex.TransformConstraintData = wasm.TransformConstraintData;
    spinex.TransformConstraint = wasm.TransformConstraint;
    spinex.Bone = wasm.Bone;
    spinex.Slot = wasm.Slot;
    spinex.Skin = wasm.Skin;
    spinex.SkinEntry = wasm.SkinEntry;
    spinex.SkeletonClipping = wasm.SkeletonClipping;
    spinex.SkeletonData = wasm.SkeletonData;
    spinex.TranslateTimeline = wasm.TranslateTimeline;
    spinex.ScaleTimeline = wasm.ScaleTimeline;
    spinex.ShearTimeline = wasm.ShearTimeline;
    spinex.RotateTimeline = wasm.RotateTimeline;
    spinex.ColorTimeline = wasm.ColorTimeline;
    spinex.TwoColorTimeline = wasm.TwoColorTimeline;
    spinex.AttachmentTimeline = wasm.AttachmentTimeline;
    spinex.DeformTimeline = wasm.DeformTimeline;
    spinex.EventTimeline = wasm.EventTimeline;
    spinex.DrawOrderTimeline = wasm.DrawOrderTimeline;
    spinex.IkConstraintTimeline = wasm.IkConstraintTimeline;
    spinex.TransformConstraintTimeline = wasm.TransformConstraintTimeline;
    spinex.PathConstraintPositionTimeline = wasm.PathConstraintPositionTimeline;
    spinex.PathConstraintMixTimeline = wasm.PathConstraintMixTimeline;
    spinex.TrackEntry = wasm.TrackEntry;
    spinex.AnimationStateData = wasm.AnimationStateData;
    spinex.AnimationState = wasm.AnimationState;
    spinex.Animation = wasm.Animation;
    spinex.EventQueue = wasm.EventQueue;
    //spinex.AnimationStateListener = wasm.AnimationStateListener;
    spinex.AnimationStateAdapter = wasm.AnimationStateAdapter;
    spinex.Skeleton = wasm.Skeleton;
    spinex.SkeletonBinary = wasm.SkeletonBinary;
    spinex.SkeletonJson = wasm.SkeletonJson;
    spinex.VertexEffect = wasm.VertexEffect;
    spinex.JitterEffect = wasm.JitterEffect;
    spinex.SwirlEffect = wasm.SwirlEffect;

    spinex.SkeletonInstance = wasm.SkeletonInstance;
    spinex.SkeletonInstance.HEAPU8 = wasm.HEAPU8;
}

function overrideProperty_BoneData () {
    const BoneData = spinex.BoneData;
    const prototype = BoneData.prototype as any;
    const spPropertyPolyfills = [
        {
            proto: prototype,
            property: 'index',
            getter: prototype.getProp_index,
            //setter: spinex.Color.prototype.setR,
        },
        // {
        //     proto: spinex.BoneData.prototype,
        //     property: 'name',
        //     getter: spinex.BoneData.prototype.getProp_name,
        // },
        {
            proto: prototype,
            property: 'parent',
            getter: prototype.getProp_parent,
        },
        {
            proto: prototype,
            property: 'length',
            getter: prototype.getProp_length,
        },
        {
            proto: prototype,
            property: 'x',
            getter: prototype.getProp_x,
        },
        {
            proto: prototype,
            property: 'y',
            getter: prototype.getProp_y,
        },
        {
            proto: prototype,
            property: 'rotation',
            getter: prototype.getProp_rotation,
        },
        {
            proto: prototype,
            property: 'scaleX',
            getter: prototype.getProp_scaleX,
        },
        {
            proto: prototype.prototype,
            property: 'scaleY',
            getter: prototype.getProp_scaleY,
        },
        {
            proto: prototype,
            property: 'shearX',
            getter: prototype.getProp_shearX,
        },
        {
            proto: prototype,
            property: 'shearY',
            getter: prototype.getProp_shearY,
        },
        {
            proto: prototype,
            property: 'transformMode',
            getter: prototype.getProp_transformMode,
        },
        {
            proto: prototype,
            property: 'skinRequired',
            getter: prototype.getProp_skinRequired,
        },
        // {
        //     proto: spinex.BoneData.prototype,
        //     property: 'color',
        //     getter: spinex.BoneData.prototype.getProp_color,
        // },
    ];
    spPropertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

export function overrideSpineDefine (wasm) {
    overrideClass(wasm);
}
