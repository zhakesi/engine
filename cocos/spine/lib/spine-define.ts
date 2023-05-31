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
    const prototype = spinex.BoneData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'index',
            getter: prototype.getProp_index,
        },
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
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
            proto: prototype,
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
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_ConstraintData () {
    const prototype = spinex.ConstraintData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
        {
            proto: prototype,
            property: 'order',
            getter: prototype.getProp_order,
        },
        {
            proto: prototype,
            property: 'skinRequired',
            getter: prototype.getProp_skinRequired,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_IkConstraintData () {
    const prototype = spinex.IkConstraintData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'target',
            getter: prototype.getProp_target,
        },
        {
            proto: prototype,
            property: 'bendDirection',
            getter: prototype.getProp_bendDirection,
        },
        {
            proto: prototype,
            property: 'compress',
            getter: prototype.getProp_compress,
        },
        {
            proto: prototype,
            property: 'stretch',
            getter: prototype.getProp_stretch,
        },
        {
            proto: prototype,
            property: 'uniform',
            getter: prototype.getProp_uniform,
        },
        {
            proto: prototype,
            property: 'mix',
            getter: prototype.getProp_mix,
        },
        {
            proto: prototype,
            property: 'softness',
            getter: prototype.getProp_softness,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_PathConstraintData () {
    const prototype = spinex.PathConstraintData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'target',
            getter: prototype.getProp_target,
        },
        {
            proto: prototype,
            property: 'positionMode',
            getter: prototype.getProp_positionMode,
        },
        {
            proto: prototype,
            property: 'spacingMode',
            getter: prototype.getProp_spacingMode,
        },
        {
            proto: prototype,
            property: 'rotateMode',
            getter: prototype.getProp_rotateMode,
        },
        {
            proto: prototype,
            property: 'offsetRotation',
            getter: prototype.getProp_offsetRotation,
        },
        {
            proto: prototype,
            property: 'position',
            getter: prototype.getProp_position,
        },
        {
            proto: prototype,
            property: 'spacing',
            getter: prototype.getProp_spacing,
        },
        {
            proto: prototype,
            property: 'rotateMix',
            getter: prototype.getProp_rotateMix,
        },
        {
            proto: prototype,
            property: 'translateMix',
            getter: prototype.getProp_translateMix,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_Event () {
    const prototype = spinex.Event.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'intValue',
            getter: prototype.getProp_intValue,
        },
        {
            proto: prototype,
            property: 'floatValue',
            getter: prototype.getProp_floatValue,
        },
        {
            proto: prototype,
            property: 'stringValue',
            getter: prototype.getProp_stringValue,
        },
        {
            proto: prototype,
            property: 'time',
            getter: prototype.getProp_time,
        },
        {
            proto: prototype,
            property: 'volume',
            getter: prototype.getProp_volume,
        },
        {
            proto: prototype,
            property: 'balance',
            getter: prototype.getProp_balance,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_EventData () {
    const prototype = spinex.EventData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
        {
            proto: prototype,
            property: 'intValue',
            getter: prototype.getProp_intValue,
        },
        {
            proto: prototype,
            property: 'floatValue',
            getter: prototype.getProp_floatValue,
        },
        {
            proto: prototype,
            property: 'stringValue',
            getter: prototype.getProp_stringValue,
        },
        {
            proto: prototype,
            property: 'audioPath',
            getter: prototype.getProp_audioPath,
        },
        {
            proto: prototype,
            property: 'volume',
            getter: prototype.getProp_volume,
        },
        {
            proto: prototype,
            property: 'balance',
            getter: prototype.getProp_balance,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_BoundingBoxAttachment () {
    const prototype = spinex.BoundingBoxAttachment.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_ClippingAttachment () {
    const prototype = spinex.ClippingAttachment.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'endSlot',
            getter: prototype.getProp_endSlot,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_MeshAttachment () {
    const prototype = spinex.MeshAttachment.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'path',
            getter: prototype.getProp_path,
        },
        {
            proto: prototype,
            property: 'regionUVs',
            getter: prototype.getProp_regionUVs,
        },
        {
            proto: prototype,
            property: 'uvs',
            getter: prototype.getProp_uvs,
        },
        {
            proto: prototype,
            property: 'triangles',
            getter: prototype.getProp_triangles,
        },
        {
            proto: prototype,
            property: 'color',
            getter: prototype.getProp_color,
        },
        {
            proto: prototype,
            property: 'width',
            getter: prototype.getProp_width,
        },
        {
            proto: prototype,
            property: 'height',
            getter: prototype.getProp_height,
        },
        {
            proto: prototype,
            property: 'hullLength',
            getter: prototype.getProp_hullLength,
        },
        {
            proto: prototype,
            property: 'edges',
            getter: prototype.getProp_edges,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_PathAttachment () {
    const prototype = spinex.PathAttachment.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'lengths',
            getter: prototype.getProp_lengths,
        },
        {
            proto: prototype,
            property: 'closed',
            getter: prototype.getProp_closed,
        },
        {
            proto: prototype,
            property: 'constantSpeed',
            getter: prototype.getProp_constantSpeed,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_PointAttachment () {
    const prototype = spinex.PointAttachment.prototype as any;
    const propertyPolyfills = [
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
            getter: prototype.rotation,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_RegionAttachment () {
    const prototype = spinex.RegionAttachment.prototype as any;
    const propertyPolyfills = [
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
            property: 'scaleX',
            getter: prototype.getProp_scaleX,
        },
        {
            proto: prototype,
            property: 'scaleY',
            getter: prototype.getProp_scaleY,
        },
        {
            proto: prototype,
            property: 'rotation',
            getter: prototype.getProp_rotation,
        },
        {
            proto: prototype,
            property: 'width',
            getter: prototype.getProp_width,
        },
        {
            proto: prototype,
            property: 'height',
            getter: prototype.getProp_height,
        },
        {
            proto: prototype,
            property: 'color',
            getter: prototype.getProp_color,
        },
        {
            proto: prototype,
            property: 'path',
            getter: prototype.getProp_path,
        },
        {
            proto: prototype,
            property: 'rendererObject',
            getter: prototype.getProp_rendererObject,
        },
        // {
        //     proto: prototype,
        //     property: 'region',
        //     getter: prototype.getProp_region,
        // },
        {
            proto: prototype,
            property: 'offset',
            getter: prototype.getProp_offset,
        },
        {
            proto: prototype,
            property: 'uvs',
            getter: prototype.getProp_uvs,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_TextureAtlas () {
    // const prototype = spinex.TextureAtlas.prototype as any;
    // const propertyPolyfills = [
    //     {
    //         proto: prototype,
    //         property: 'pages',
    //         getter: prototype.getProp_pages,
    //     },
    //     {
    //         proto: prototype,
    //         property: 'regions',
    //         getter: prototype.getProp_regions,
    //     },
    // ];
    // propertyPolyfills.forEach((prop) => {
    //     js.getset(prop.proto, prop.property, prop.getter);
    // });
}

function overrideProperty_SlotData () {
    const prototype = spinex.SlotData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'index',
            getter: prototype.getProp_index,
        },
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
        {
            proto: prototype,
            property: 'boneData',
            getter: prototype.getProp_boneData,
        },
        {
            proto: prototype,
            property: 'color',
            getter: prototype.color,
        },
        {
            proto: prototype,
            property: 'darkColor',
            getter: prototype.getProp_darkColor,
        },
        {
            proto: prototype,
            property: 'blendMode',
            getter: prototype.getProp_blendMode,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_IkConstraint () {
    const prototype = spinex.IkConstraint.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'target',
            getter: prototype.getProp_target,
        },
        {
            proto: prototype,
            property: 'bendDirection',
            getter: prototype.getProp_bendDirection,
        },
        {
            proto: prototype,
            property: 'compress',
            getter: prototype.getProp_compress,
        },
        {
            proto: prototype,
            property: 'stretch',
            getter: prototype.getProp_stretch,
        },
        {
            proto: prototype,
            property: 'mix',
            getter: prototype.getProp_mix,
        },
        {
            proto: prototype,
            property: 'softness',
            getter: prototype.getProp_softness,
        },
        {
            proto: prototype,
            property: 'active',
            getter: prototype.getProp_active,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_PathConstraint () {
    const prototype = spinex.PathConstraint.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'target',
            getter: prototype.getProp_target,
        },
        {
            proto: prototype,
            property: 'position',
            getter: prototype.getProp_position,
        },
        {
            proto: prototype,
            property: 'spacing',
            getter: prototype.getProp_spacing,
        },
        {
            proto: prototype,
            property: 'rotateMix',
            getter: prototype.getProp_rotateMix,
        },
        {
            proto: prototype,
            property: 'translateMix',
            getter: prototype.getProp_translateMix,
        },
        {
            proto: prototype,
            property: 'active',
            getter: prototype.getProp_active,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_TransformConstraintData () {
    const prototype = spinex.TransformConstraintData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'target',
            getter: prototype.getProp_target,
        },
        {
            proto: prototype,
            property: 'rotateMix',
            getter: prototype.getProp_rotateMix,
        },
        {
            proto: prototype,
            property: 'translateMix',
            getter: prototype.getProp_translateMix,
        },
        {
            proto: prototype,
            property: 'scaleMix',
            getter: prototype.getProp_scaleMix,
        },
        {
            proto: prototype,
            property: 'shearMix',
            getter: prototype.getProp_shearMix,
        },
        {
            proto: prototype,
            property: 'offsetRotation',
            getter: prototype.getProp_offsetRotation,
        },
        {
            proto: prototype,
            property: 'offsetX',
            getter: prototype.getProp_offsetX,
        },
        {
            proto: prototype,
            property: 'offsetY',
            getter: prototype.getProp_offsetY,
        },
        {
            proto: prototype,
            property: 'offsetScaleX',
            getter: prototype.getProp_offsetScaleX,
        },
        {
            proto: prototype,
            property: 'offsetScaleY',
            getter: prototype.getProp_offsetScaleY,
        },
        {
            proto: prototype,
            property: 'offsetShearY',
            getter: prototype.getProp_offsetShearY,
        },
        {
            proto: prototype,
            property: 'relative',
            getter: prototype.getProp_relative,
        },
        {
            proto: prototype,
            property: 'local',
            getter: prototype.getProp_local,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_TransformConstraint () {
    const prototype = spinex.TransformConstraint.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'target',
            getter: prototype.getProp_target,
        },
        {
            proto: prototype,
            property: 'rotateMix',
            getter: prototype.getProp_rotateMix,
        },
        {
            proto: prototype,
            property: 'translateMix',
            getter: prototype.getProp_translateMix,
        },
        {
            proto: prototype,
            property: 'scaleMix',
            getter: prototype.getProp_scaleMix,
        },
        {
            proto: prototype,
            property: 'shearMix',
            getter: prototype.getProp_shearMix,
        },
        {
            proto: prototype,
            property: 'active',
            getter: prototype.getProp_active,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_Bone () {
    const prototype = spinex.Bone.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'skeleton',
            getter: prototype.getProp_skeleton,
        },
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'parent',
            getter: prototype.getProp_parent,
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
            proto: prototype,
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
            property: 'ax',
            getter: prototype.getProp_ax,
        },
        {
            proto: prototype,
            property: 'ay',
            getter: prototype.getProp_ay,
        },
        {
            proto: prototype,
            property: 'arotation',
            getter: prototype.getProp_arotation,
        },
        {
            proto: prototype,
            property: 'ascaleX',
            getter: prototype.getProp_ascaleX,
        },
        {
            proto: prototype,
            property: 'ascaleY',
            getter: prototype.getProp_ascaleY,
        },
        {
            proto: prototype,
            property: 'ashearX',
            getter: prototype.getProp_ashearX,
        },
        {
            proto: prototype,
            property: 'ashearY',
            getter: prototype.getProp_ashearY,
        },
        {
            proto: prototype,
            property: 'appliedValid',
            getter: prototype.getProp_appliedValid,
        },
        {
            proto: prototype,
            property: 'a',
            getter: prototype.getProp_a,
        },
        {
            proto: prototype,
            property: 'b',
            getter: prototype.getProp_b,
        },
        {
            proto: prototype,
            property: 'c',
            getter: prototype.getProp_c,
        },
        {
            proto: prototype,
            property: 'd',
            getter: prototype.getProp_d,
        },
        {
            proto: prototype,
            property: 'worldY',
            getter: prototype.getProp_worldY,
        },
        {
            proto: prototype,
            property: 'worldX',
            getter: prototype.getProp_worldX,
        },
        {
            proto: prototype,
            property: 'active',
            getter: prototype.getProp_active,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_Slot () {
    const prototype = spinex.Slot.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'bone',
            getter: prototype.getProp_bone,
        },
        {
            proto: prototype,
            property: 'color',
            getter: prototype.getProp_color,
        },
        {
            proto: prototype,
            property: 'darkColor',
            getter: prototype.getProp_darkColor,
        },
        {
            proto: prototype,
            property: 'deform',
            getter: prototype.getProp_deform,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_Skin () {
    const prototype = spinex.Skin.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
        {
            proto: prototype,
            property: 'attachments',
            getter: prototype.getProp_attachments,
        },
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'constraints',
            getter: prototype.getProp_constraints,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_SkinEntry () {
    const prototype = spinex.SkinEntry.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'attachment',
            getter: prototype.getProp_attachment,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_SkeletonClipping () {
    const prototype = spinex.SkeletonClipping.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'clippedVertices',
            getter: prototype.getProp_clippedVertices,
        },
        {
            proto: prototype,
            property: 'clippedTriangles',
            getter: prototype.getProp_clippedTriangles,
        },
        {
            proto: prototype,
            property: 'UVs',
            getter: prototype.getProp_UVs,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_SkeletonData () {
    const prototype = spinex.SkeletonData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
        {
            proto: prototype,
            property: 'bones',
            getter: prototype.getProp_bones,
        },
        {
            proto: prototype,
            property: 'slots',
            getter: prototype.getProp_slots,
        },
        {
            proto: prototype,
            property: 'skins',
            getter: prototype.getProp_skins,
        },
        {
            proto: prototype,
            property: 'defaultSkin',
            getter: prototype.getProp_defaultSkin,
        },
        {
            proto: prototype,
            property: 'events',
            getter: prototype.getProp_events,
        },
        {
            proto: prototype,
            property: 'animations',
            getter: prototype.getProp_animations,
        },
        {
            proto: prototype,
            property: 'ikConstraints',
            getter: prototype.getProp_ikConstraints,
        },
        {
            proto: prototype,
            property: 'transformConstraints',
            getter: prototype.getProp_transformConstraints,
        },
        {
            proto: prototype,
            property: 'pathConstraints',
            getter: prototype.getProp_pathConstraints,
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
            property: 'width',
            getter: prototype.getProp_width,
        },
        {
            proto: prototype,
            property: 'height',
            getter: prototype.getProp_height,
        },
        {
            proto: prototype,
            property: 'version',
            getter: prototype.getProp_version,
        },
        {
            proto: prototype,
            property: 'hash',
            getter: prototype.getProp_hash,
        },
        {
            proto: prototype,
            property: 'fps',
            getter: prototype.getProp_fps,
        },
        {
            proto: prototype,
            property: 'imagesPath',
            getter: prototype.getProp_imagesPath,
        },
        {
            proto: prototype,
            property: 'audioPath',
            getter: prototype.getProp_audioPath,
        },
        {
            proto: prototype,
            property: 'audioPath',
            getter: prototype.getProp_audioPath,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_RotateTimeline () {
    const prototype = spinex.RotateTimeline.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'boneIndex',
            getter: prototype.getProp_boneIndex,
        },
        {
            proto: prototype,
            property: 'frames',
            getter: prototype.getProp_frames,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_ColorTimeline () {
    const prototype = spinex.ColorTimeline.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'slotIndex',
            getter: prototype.getProp_slotIndex,
        },
        {
            proto: prototype,
            property: 'frames',
            getter: prototype.getProp_frames,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_TwoColorTimeline () {
    const prototype = spinex.TwoColorTimeline.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'slotIndex',
            getter: prototype.getProp_slotIndex,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_AttachmentTimeline () {
    const prototype = spinex.AttachmentTimeline.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'slotIndex',
            getter: prototype.getProp_slotIndex,
        },
        {
            proto: prototype,
            property: 'frames',
            getter: prototype.getProp_frames,
        },
        {
            proto: prototype,
            property: 'attachmentNames',
            getter: prototype.getProp_attachmentNames,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_DeformTimeline () {
    const prototype = spinex.DeformTimeline.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'slotIndex',
            getter: prototype.getProp_slotIndex,
        },
        {
            proto: prototype,
            property: 'attachment',
            getter: prototype.getProp_attachment,
        },
        {
            proto: prototype,
            property: 'frames',
            getter: prototype.getProp_frames,
        },
        {
            proto: prototype,
            property: 'frameVertices',
            getter: prototype.getProp_frameVertices,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_EventTimeline () {
    const prototype = spinex.EventTimeline.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'frames',
            getter: prototype.getProp_frames,
        },
        {
            proto: prototype,
            property: 'events',
            getter: prototype.getProp_events,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_DrawOrderTimeline () {
    const prototype = spinex.DrawOrderTimeline.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'frames',
            getter: prototype.getProp_frames,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_TrackEntry () {
    const prototype = spinex.TrackEntry.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'animation',
            getter: prototype.getProp_animation,
        },
        {
            proto: prototype,
            property: 'next',
            getter: prototype.getProp_next,
        },
        {
            proto: prototype,
            property: 'mixingFrom',
            getter: prototype.getProp_mixingFrom,
        },
        {
            proto: prototype,
            property: 'mixingTo',
            getter: prototype.getProp_mixingTo,
        },
        {
            proto: prototype,
            property: 'trackIndex',
            getter: prototype.getProp_trackIndex,
        },
        {
            proto: prototype,
            property: 'loop',
            getter: prototype.getProp_loop,
        },
        {
            proto: prototype,
            property: 'holdPrevious',
            getter: prototype.getProp_holdPrevious,
        },
        {
            proto: prototype,
            property: 'eventThreshold',
            getter: prototype.getProp_eventThreshold,
        },
        {
            proto: prototype,
            property: 'attachmentThreshold',
            getter: prototype.getProp_attachmentThreshold,
        },
        {
            proto: prototype,
            property: 'drawOrderThreshold',
            getter: prototype.getProp_drawOrderThreshold,
        },
        {
            proto: prototype,
            property: 'animationStart',
            getter: prototype.getProp_animationStart,
        },
        {
            proto: prototype,
            property: 'animationEnd',
            getter: prototype.getProp_animationEnd,
        },
        {
            proto: prototype,
            property: 'animationLast',
            getter: prototype.getProp_animationLast,
        },
        {
            proto: prototype,
            property: 'delay',
            getter: prototype.getProp_delay,
        },
        {
            proto: prototype,
            property: 'trackTime',
            getter: prototype.getProp_trackTime,
        },
        {
            proto: prototype,
            property: 'trackEnd',
            getter: prototype.getProp_trackEnd,
        },
        {
            proto: prototype,
            property: 'timeScale',
            getter: prototype.getProp_timeScale,
        },
        {
            proto: prototype,
            property: 'alpha',
            getter: prototype.getProp_alpha,
        },
        {
            proto: prototype,
            property: 'mixTime',
            getter: prototype.getProp_mixTime,
        },
        {
            proto: prototype,
            property: 'mixDuration',
            getter: prototype.getProp_mixDuration,
        },
        {
            proto: prototype,
            property: 'mixBlend',
            getter: prototype.getProp_mixBlend,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_AnimationStateData () {
    const prototype = spinex.AnimationStateData.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'defaultMix',
            getter: prototype.getProp_defaultMix,
        },
        {
            proto: prototype,
            property: 'skeletonData',
            getter: prototype.getProp_skeletonData,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_AnimationState () {
    const prototype = spinex.AnimationState.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'tracks',
            getter: prototype.getProp_tracks,
        },
        {
            proto: prototype,
            property: 'timeScale',
            getter: prototype.getProp_timeScale,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_Animation () {
    const prototype = spinex.Animation.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'name',
            getter: prototype.getProp_name,
        },
        {
            proto: prototype,
            property: 'timelines',
            getter: prototype.getProp_timelines,
        },
        {
            proto: prototype,
            property: 'duration',
            getter: prototype.getProp_duration,
        },
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
}

function overrideProperty_Skeleton () {
    const prototype = spinex.Skeleton.prototype as any;
    const propertyPolyfills = [
        {
            proto: prototype,
            property: 'data',
            getter: prototype.getProp_data,
        },
        {
            proto: prototype,
            property: 'slots',
            getter: prototype.getProp_slots,
        },
        {
            proto: prototype,
            property: 'drawOrder',
            getter: prototype.getProp_drawOrder,
        },
        {
            proto: prototype,
            property: 'ikConstraints',
            getter: prototype.getProp_ikConstraints,
        },
        {
            proto: prototype,
            property: 'transformConstraints',
            getter: prototype.getProp_transformConstraints,
        },
        {
            proto: prototype,
            property: 'pathConstraints',
            getter: prototype.getProp_pathConstraints,
        },
        {
            proto: prototype,
            property: '_updateCache',
            getter: prototype.getProp__updateCache,
        },
        {
            proto: prototype,
            property: 'skin',
            getter: prototype.getProp_skin,
        },
        {
            proto: prototype,
            property: 'color',
            getter: prototype.getProp_color,
        },
        {
            proto: prototype,
            property: 'time',
            getter: prototype.getProp_time,
        },
        {
            proto: prototype,
            property: 'scaleX',
            getter: prototype.getProp_scaleX,
        },
        {
            proto: prototype,
            property: 'scaleY',
            getter: prototype.getProp_scaleY,
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
    ];
    propertyPolyfills.forEach((prop) => {
        js.getset(prop.proto, prop.property, prop.getter);
    });
    Object.defineProperty(prototype, 'bones', {
        get () {
            const bones: any[] = [];
            const bonesVector = this.getProp_bones();
            const count = bonesVector.size();
            for (let i = 0; i < count; i++) {
                const bonePtr = bonesVector.get(i);
                bones.push(bonePtr);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return bones;
        },
    });
}

export function overrideSpineDefine (wasm) {
    overrideClass(wasm);
    overrideProperty_BoneData();
    overrideProperty_ConstraintData();
    overrideProperty_IkConstraintData();
    overrideProperty_PathConstraintData();
    overrideProperty_Event();
    overrideProperty_EventData();
    overrideProperty_BoundingBoxAttachment();
    overrideProperty_ClippingAttachment();
    overrideProperty_MeshAttachment();
    overrideProperty_PathAttachment();
    overrideProperty_PointAttachment();
    overrideProperty_RegionAttachment();
    overrideProperty_TextureAtlas();
    overrideProperty_SlotData();
    overrideProperty_IkConstraint();
    overrideProperty_PathConstraint();
    overrideProperty_TransformConstraintData();
    overrideProperty_TransformConstraint();
    overrideProperty_Bone();
    overrideProperty_Slot();
    overrideProperty_Skin();
    overrideProperty_SkinEntry();
    overrideProperty_SkeletonClipping();
    overrideProperty_SkeletonData();
    overrideProperty_RotateTimeline();
    overrideProperty_ColorTimeline();
    overrideProperty_TwoColorTimeline();
    overrideProperty_AttachmentTimeline();
    overrideProperty_DeformTimeline();
    overrideProperty_EventTimeline();
    overrideProperty_DrawOrderTimeline();
    overrideProperty_TrackEntry();
    overrideProperty_AnimationStateData();
    overrideProperty_AnimationState();
    overrideProperty_Animation();
    overrideProperty_Skeleton();
}
