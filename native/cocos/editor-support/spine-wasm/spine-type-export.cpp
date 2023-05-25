#include <spine/spine.h>
#include "spine-skeleton-instance.h"
#include <emscripten/bind.h>
#include <memory>

using namespace emscripten;
using namespace spine;

EMSCRIPTEN_BINDINGS(spine) {
    enum_<TimelineType>("TimelineType")
        .value("rotate", TimelineType_Rotate)
        .value("translate", TimelineType_Translate)
        .value("scale", TimelineType_Scale)
        .value("shear", TimelineType_Shear)
        .value("attachment", TimelineType_Attachment)
        .value("color", TimelineType_Color)
        .value("deform", TimelineType_Deform)
        .value("event", TimelineType_Event)
        .value("drawOrder", TimelineType_DrawOrder)
        .value("ikConstraint", TimelineType_IkConstraint)
        .value("transformConstraint", TimelineType_TransformConstraint)
        .value("pathConstraintPosition", TimelineType_PathConstraintPosition)
        .value("pathConstraintSpacing", TimelineType_PathConstraintSpacing)
        .value("pathConstraintMix", TimelineType_PathConstraintMix)
        .value("twoColor", TimelineType_TwoColor);
    
    enum_<MixDirection>("MixDirection")
        .value("mixIn", MixDirection_In)
        .value("mixOut", MixDirection_Out);

    enum_<MixBlend>("MixBlend")
        .value("setup", MixBlend_Setup)
        .value("first", MixBlend_First)
        .value("replace", MixBlend_Replace)
        .value("add", MixBlend_Add);

    enum_<BlendMode>("BlendMode")
        .value("Normal", BlendMode_Normal)
        .value("Additive", BlendMode_Additive)
        .value("Multiply", BlendMode_Multiply)
        .value("Screen", BlendMode_Screen);

    enum_<EventType>("EventType")
        .value("start", EventType_Start)
        .value("interrupt", EventType_Interrupt)
        .value("end", EventType_End)
        .value("dispose", EventType_Complete)
        .value("complete", EventType_Dispose)
        .value("event", EventType_Event);

    enum_<TransformMode>("TransformMode")
        .value("Normal", TransformMode_Normal)
        .value("OnlyTranslation", TransformMode_OnlyTranslation)
        .value("NoRotationOrReflection", TransformMode_NoRotationOrReflection)
        .value("NoScale", TransformMode_NoScale)
        .value("NoScaleOrReflection", TransformMode_NoScaleOrReflection);

    enum_<PositionMode>("PositionMode")
        .value("Fixed", PositionMode_Fixed)
        .value("Percent", PositionMode_Percent);

    enum_<SpacingMode>("SpacingMode")
        .value("Length", SpacingMode_Length)
        .value("Fixed", SpacingMode_Fixed)
        .value("Percent", SpacingMode_Percent);

    enum_<RotateMode>("RotateMode")
        .value("Tangent", RotateMode_Tangent)
        .value("Chain", RotateMode_Chain)
        .value("ChainScale", RotateMode_ChainScale);

    enum_<TextureFilter>("TextureFilter")
        .value("Unknown", TextureFilter_Unknown)
        .value("Nearest", TextureFilter_Nearest)
        .value("Linear", TextureFilter_Linear)
        .value("MipMap", TextureFilter_MipMap)
        .value("MipMapNearestNearest", TextureFilter_MipMapNearestNearest)
        .value("MipMapLinearNearest", TextureFilter_MipMapLinearNearest)
        .value("MipMapNearestLinear", TextureFilter_MipMapNearestLinear)
        .value("MipMapLinearLinear", TextureFilter_MipMapLinearLinear);

    enum_<TextureWrap>("TextureWrap")
        .value("MirroredRepeat", TextureWrap_MirroredRepeat)
        .value("ClampToEdge", TextureWrap_ClampToEdge)
        .value("Repeat", TextureWrap_Repeat);

    enum_<AttachmentType>("AttachmentType")
        .value("Region", AttachmentType_Region)
        .value("BoundingBox", AttachmentType_Boundingbox)
        .value("Mesh", AttachmentType_Mesh)
        .value("LinkedMesh", AttachmentType_Linkedmesh)
        .value("Path", AttachmentType_Path)
        .value("Point", AttachmentType_Point)
        .value("Clipping", AttachmentType_Clipping);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // class_<Vector>("Vector")
    //     .constructor<>()
    //     .constructor<const Vector &>()
    //     .function("size", &Vector::size);

    class_<Color>("Color")
        .constructor<>()
        .constructor<float, float, float, float>()
        .function("set", static_cast<Color&(Color::*)(float, float, float, float)>(&Color::set))
        //.function("setFromColor", static_cast<Color&(Color::*)(const Color&)>(&Color::set)) //no need
        .function("add", static_cast<Color&(Color::*)(float, float, float, float)>(&Color::add))
        .function("clamp", &Color::clamp)
        .property("r", &Color::r)
        .property("g", &Color::g)
        .property("b", &Color::b)
        .property("a", &Color::a);
    
    class_<Interpolation>("Interpolation")
        .function("apply", &Interpolation::apply, pure_virtual());

    class_<ConstraintData>("ConstraintData")
        .constructor<const String& >()
        .function("getProp_name", &ConstraintData::getName)
        .function("getProp_order", &ConstraintData::getOrder)
        .function("getProp_skinRequired", &ConstraintData::isSkinRequired);

    // class_<Attachment>("Attachment")
    //     .constructor<const String& >()
    //     .function("getProp_name", &Attachment::getName)
    //     .function("copy", &Attachment::copy, allow_raw_pointer<Attachment>());

    // pure_virtual and raw pointer 
    // class_<VertexAttachment>("VertexAttachment")
    //     .constructor<const String& >()
    //     .function("getProp_id", &VertexAttachment::getId)
    //     .function("getProp_bones", &VertexAttachment::getBones)
    //     .function("getProp_vertices", &VertexAttachment::getVertices)
    //     .function("getProp_worldVerticesLength", &VertexAttachment::getWorldVerticesLength)
    //     .function("getProp_deformAttachment", &VertexAttachment::getDeformAttachment, allow_raw_pointer<VertexAttachment>())
    //     .function("getProp_name", &VertexAttachment::getName)
    //     //.function("computeWorldVertices", &VertexAttachment::computeWorldVertices);
    //     .function("copy", &VertexAttachment::copy, pure_virtual())
    //     .function("copyTo", &VertexAttachment::copyTo, allow_raw_pointer<VertexAttachment>());

    class_<BoundingBoxAttachment>("BoundingBoxAttachment")
        .constructor<const String& >()
        .function("getProp_name", &BoundingBoxAttachment::getName)
        .function("copy", &BoundingBoxAttachment::copy, allow_raw_pointer<Attachment>());
        //.function("getProp_color", &BoundingBoxAttachment::getColor)

    class_<ClippingAttachment>("ClippingAttachment")
        .constructor<const String& >()
        .function("getProp_endSlot", &ClippingAttachment::getEndSlot, allow_raw_pointer<SlotData>())
        .function("copy", &ClippingAttachment::copy, allow_raw_pointer<Attachment>());
        //.function("getProp_color", &BoundingBoxAttachment::getColor)

    class_<MeshAttachment>("MeshAttachment")
        .constructor<const String& >()
        //.function("getProp_region", &MeshAttachment::getRegion)
        .function("getProp_path", &MeshAttachment::getPath)
        .function("getProp_regionUVs", &MeshAttachment::getRegionUVs)
        .function("getProp_uvs", &MeshAttachment::getUVs)
        .function("getProp_triangles", &MeshAttachment::getTriangles)
        .function("getProp_color", &MeshAttachment::getColor)
        .function("getProp_width", &MeshAttachment::getWidth)
        .function("getProp_height", &MeshAttachment::getHeight)
        .function("getProp_hullLength", &MeshAttachment::getHullLength)
        .function("getProp_edges", &MeshAttachment::getEdges)
        //.function("getProp_tempColor", &MeshAttachment::getTempColor) // no tempColor
        .function("updateUVs", &MeshAttachment::updateUVs)
        .function("getParentMesh", &MeshAttachment::getParentMesh, allow_raw_pointer<MeshAttachment>())
        .function("setParentMesh", &MeshAttachment::setParentMesh, allow_raw_pointer<MeshAttachment>())
        .function("copy", &MeshAttachment::copy, allow_raw_pointer<Attachment>())
        .function("newLinkedMesh", &MeshAttachment::newLinkedMesh, allow_raw_pointer<MeshAttachment>());

    class_<PathAttachment>("PathAttachment")
        .constructor<const String& >()
        .function("getProp_lengths", &PathAttachment::getLengths)
        .function("getProp_closed", &PathAttachment::isClosed)
        .function("getProp_constantSpeed", &PathAttachment::isConstantSpeed)
        //.function("getProp_color", &MeshAttachment::getColor) // no color
        .function("copy", &PathAttachment::copy, allow_raw_pointer<Attachment>());

    class_<PointAttachment>("PointAttachment")
        .constructor<const String& >()
        .function("getProp_x", &PointAttachment::getX)
        .function("getProp_y", &PointAttachment::getY)
        .function("getProp_rotation", &PointAttachment::getRotation)
        //.function("computeWorldPosition", &PointAttachment::computeWorldPosition) //reference type
        .function("computeWorldRotation", &PointAttachment::computeWorldRotation)
        //.function("getProp_color", &MeshAttachment::getColor) // no color
        .function("copy", &PointAttachment::copy, allow_raw_pointer<Attachment>());

    //class_<HasRendererObject>("HasRendererObject")
    //    .constructor<>();


    class_<RegionAttachment, base<HasRendererObject>>("RegionAttachment")
        .constructor<const String& >()
        // static U4: number;
        // static V4: number;
        // .......
        .function("getProp_x", &RegionAttachment::getX)
        .function("getProp_y", &RegionAttachment::getY)
        .function("getProp_scaleX", &RegionAttachment::getScaleX)
        .function("getProp_scaleY", &RegionAttachment::getScaleY)
        .function("getProp_rotation", &RegionAttachment::getRotation)
        .function("getProp_width", &RegionAttachment::getWidth)
        .function("getProp_height", &RegionAttachment::getHeight)
        .function("getProp_color", &RegionAttachment::getColor)
        .function("getProp_path", &RegionAttachment::getPath)
        .function("getProp_rendererObject", &RegionAttachment::getRendererObject, allow_raw_pointer<void>())
        //.function("getProp_region", &PointAttachment::getRegion)
        .function("getProp_offset", &RegionAttachment::getOffset)
        .function("getProp_uvs", &RegionAttachment::getUVs)
        //.function("getProp_tempColor", &PointAttachment::getTempColor) // have no tempColor
        .function("updateOffset", &RegionAttachment::updateOffset)
        //.function("setRegion", &RegionAttachment::setRegion) // have no setRegion
        .function("copy", &RegionAttachment::copy, allow_raw_pointer<Attachment>());

    class_<PowInterpolation, base<Interpolation>>("Pow")
        .constructor<int>()
        .function("apply", &PowInterpolation::apply);
    
    class_<PowOutInterpolation, base<Interpolation>>("PowOut")
        .constructor<int>()
        .function("apply", &PowInterpolation::apply);
 
    // class_<Vector2>("Vector2")
    //     .constructor<float, float>()
    //     .function("set", static_cast<Vector2&(Vector2::*)(float, float)>(&Vector2::set))
    //     .function("length", &Vector2::length)
    //     .function("normalize", static_cast<Vector2&(Vector2::*)()>(&Vector2::normalize))
    //     .property("x", &Vector2::x)
    //     .property("y", &Vector2::y);

    class_<BoneData>("BoneData")
        .constructor<int, const String&, BoneData *>()
        .property("index", &BoneData::getIndex)
        .property("name", &BoneData::getName_Export)
        .property("parent", &BoneData::getParent_Export)
        .property("length", &BoneData::getLength, &BoneData::setLength)
        .property("x", &BoneData::getX, &BoneData::setX)
        .property("y", &BoneData::getY, &BoneData::setY)
        .property("rotation", &BoneData::getRotation, &BoneData::setRotation)
        .property("scaleX", &BoneData::getScaleX, &BoneData::setScaleX)
        .property("scaleY", &BoneData::getScaleY, &BoneData::setScaleY)
        .property("shearX", &BoneData::getShearX, &BoneData::setShearX)
        .property("shearY", &BoneData::getShearY, &BoneData::setShearY)
        .property("transformMode", &BoneData::getTransformMode, &BoneData::setTransformMode)
        .property("skinRequired", &BoneData::isSkinRequired, &BoneData::setSkinRequired)
        //---------------------------------------------------------------------------
        .function("getProp_index", &BoneData::getIndex)
        .function("getProp_name", &BoneData::getName)
        .function("getProp_parent", &BoneData::getParent, allow_raw_pointer<BoneData>())
        .function("getProp_length", &BoneData::getLength)
        .function("getProp_x", &BoneData::getX)
        .function("getProp_y", &BoneData::getY)
        .function("getProp_rotation", &BoneData::getRotation)
        .function("getProp_scaleX", &BoneData::getScaleX)
        .function("getProp_scaleY", &BoneData::getScaleY)
        .function("getProp_shearX", &BoneData::getShearX)
        .function("getProp_shearY", &BoneData::getShearY)
        .function("getProp_transformMode", &BoneData::getTransformMode)
        .function("getProp_skinRequired", &BoneData::isSkinRequired);
        //.function("getProp_color", &BoneData::isSkinRequired) // have no color
    
    class_<SlotData>("SlotData")
        .constructor<int, const String&, BoneData &>()
        .function("getProp_index", &SlotData::getIndex)
        .function("getProp_name", &SlotData::getName)
        .function("getProp_boneData", &SlotData::getBoneData)
        .function("getProp_color", &SlotData::getColor)
        .function("getProp_darkColor", &SlotData::getDarkColor)
        .function("getProp_blendMode", &SlotData::getBlendMode);
        
    class_<Updatable>("Updatable")
        .function("update", &Updatable::update, pure_virtual())
        .function("isActive", &Updatable::isActive, pure_virtual());

    class_<Bone, base<Updatable>>("Bone")
        .constructor<BoneData &, Skeleton &, Bone *>()
        .property("a", &Bone::getA, &Bone::setA)
        .property("b", &Bone::getB, &Bone::setB)
        .property("c", &Bone::getC, &Bone::setC)
        .property("d", &Bone::getD, &Bone::setD)
        .property("worldX", &Bone::getWorldX, &Bone::setWorldX)
        .property("worldY", &Bone::getWorldY, &Bone::setWorldY)
        .property("data", &Bone::getData)
        .function("getParent", &Bone::getParent_Export, allow_raw_pointer<Bone>())
        .function("getProp_data", &Bone::getData)
        .function("getProp_skeleton", &Bone::getSkeleton)
        //.function("getProp_parent", &Bone::getParent)
        //.function("getProp_children", &Bone::getChildren)
        .function("getProp_x", &Bone::getX)
        .function("getProp_y", &Bone::getY)
        .function("getProp_rotation", &Bone::getRotation)
        .function("getProp_scaleX", &Bone::getScaleX)
        .function("getProp_scaleY", &Bone::getScaleY)
        .function("getProp_shearX", &Bone::getShearX)
        .function("getProp_shearY", &Bone::getShearY)
        .function("getProp_ax", &Bone::getAX)
        .function("getProp_ay", &Bone::getAY)
        .function("getProp_arotation", &Bone::getAppliedRotation)
        .function("getProp_ascaleX", &Bone::getAScaleX)
        .function("getProp_ascaleY", &Bone::getAScaleY)
        .function("getProp_ashearX", &Bone::getAShearX)
        .function("getProp_ashearY", &Bone::getAShearY)
        .function("getProp_appliedValid", &Bone::isAppliedValid)
        .function("getProp_a", &Bone::getA)
        .function("getProp_b", &Bone::getB)
        .function("getProp_c", &Bone::getC)
        .function("getProp_d", &Bone::getD)
        .function("getProp_worldY", &Bone::getWorldY)
        .function("getProp_worldX", &Bone::getWorldX)
        //.function("getProp_sorted", &Bone::getSorted)
        .function("getProp_active", &Bone::isActive)
        .function("isActive", &Bone::isActive)
        .function("update", &Bone::update)
        .function("updateWorldTransform", select_overload<void()>(&Bone::updateWorldTransform))
        .function("updateWorldTransformWith", select_overload<void(float, float , float, float , float , float , float )>(&Bone::updateWorldTransform))
        .function("setToSetupPose", &Bone::setToSetupPose)
        .function("getWorldRotationX", &Bone::getWorldRotationX)
        .function("getWorldRotationY", &Bone::getWorldRotationY)
        .function("getWorldScaleX", &Bone::getWorldScaleX)
        .function("getWorldScaleY", &Bone::getWorldScaleY)
        //.function("updateAppliedTransform", &Bone::updateAppliedTransform)
        //.function("worldToLocal", &Bone::worldToLocal)
        //.function("localToWorld", &Bone::localToWorld)
        .function("worldToLocalRotation", &Bone::worldToLocalRotation)
        .function("localToWorldRotation", &Bone::localToWorldRotation)
        .function("rotateWorld", &Bone::rotateWorld);

    class_<Slot>("Slot")
        .constructor<SlotData &, Bone &>()
        .function("getProp_data", &Slot::getData)
        .function("getProp_bone", &Slot::getBone)
        .function("getProp_color", &Slot::getColor)
        .function("getProp_darkColor", &Slot::getDarkColor)
        //.function("getProp_attachment", &Slot::getAttachment, allow_raw_pointer<Attachment>())
        //.function("getProp_attachmentState", &Slot::getAttachmentState, allow_raw_pointer<Attachment>())
        .function("getProp_deform", &Slot::getDeform)
        .function("getSkeleton", &Slot::getSkeleton)
        //.function("getAttachment", &Slot::getAttachment)
        //.function("setAttachment", &Slot::setAttachment)
        .function("setAttachmentTime", &Slot::setAttachmentTime)
        .function("getAttachmentTime", &Slot::getAttachmentTime)
        .function("setToSetupPose", &Slot::setToSetupPose);

    class_<Skin>("Skin")
        .constructor<const String&>()
        .property("name", &Skin::getName_Export)
        .function("getProp_attachments", &Skin::getAttachments)
        .function("getProp_bones", &Skin::getBones)
        .function("getProp_constraints", &Skin::getConstraints)
        .function("setAttachment", select_overload<void(size_t, const String &, Attachment *)>(&Skin::setAttachment), allow_raw_pointers())
        .function("addSkin", select_overload<void(Skin *)>(&Skin::addSkin), allow_raw_pointers())
        .function("copySkin", select_overload<void(Skin *)>(&Skin::copySkin), allow_raw_pointers())
        .function("getAttachments", select_overload<Skin::AttachmentMap::Entries ()>(&Skin::getAttachments))
        .function("removeAttachment", select_overload<void(size_t, const String &)>(&Skin::removeAttachment))
        .function("getAttachmentsForSlot", select_overload<void(size_t, Vector<Attachment *> &)>(&Skin::findAttachmentsForSlot), allow_raw_pointers())
        //.function("clear", &Skin::clear); // have no clear
        .function("attachAll", &Skin::attachAll);

    class_<Skin::AttachmentMap::Entry>("SkinEntry")
        .constructor<size_t, const String &, Attachment *>()
        .property("slotIndex", &Skin::AttachmentMap::Entry::_slotIndex)
        .property("name", &Skin::AttachmentMap::Entry::_name)
        .function("getProp_attachment", &Skin::AttachmentMap::Entry::getAttachment, allow_raw_pointers());
        // .function("attachment", select_overload<void(Attachment *)>(&Skin::AttachmentMap::Entry::setAttachment), allow_raw_pointers())

    class_<SkeletonData>("SkeletonData")
        .constructor<>()
        .property("width",&spine::SkeletonData::getWidth, &spine::SkeletonData::setWidth)
        .property("height",&spine::SkeletonData::getHeight, &spine::SkeletonData::setHeight);


    // class_<Timeline>("Timeline")
    //     .constructor<>()
    //     .function("apply", &Timeline::apply, allow_raw_pointers())
    //     .function("getPropertyId", &Timeline::getPropertyId, allow_raw_pointers());

    // class_<CurveTimeline>("CurveTimeline")
    //     .constructor<int>()
    //     // static const float LINEAR;
    //     // static const float STEPPED;
    //     // static const float BEZIER;
    //     // static const int BEZIER_SIZE;
    //     .function("getPropertyId", &CurveTimeline::getPropertyId, pure_virtual())
    //     .function("getFrameCount", &CurveTimeline::getFrameCount)
    //     .function("setLinear", &CurveTimeline::setLinear)
    //     .function("setStepped", &CurveTimeline::setStepped)
    //     .function("getCurveType", &CurveTimeline::getCurveType)
    //     .function("setCurve", &CurveTimeline::setCurve)
    //     .function("getCurvePercent", &CurveTimeline::getCurvePercent)
    //     .function("apply", &CurveTimeline::apply, pure_virtual(&Timeline::apply), allow_raw_pointers());

    class_<TranslateTimeline>("TranslateTimeline")
        .constructor<int>()
        // will wrap in js
        // static const int ENTRIES
        // static const int PREV_TIME;
        // static const int PREV_X;
        // static const int PREV_Y;
        // static const int X;
        // static const int Y;
        //.function("getProp_boneIndex", &TranslateTimeline::getBoneIndex)
        //.function("getProp_frames", &TranslateTimeline::getFrames)
        .function("getPropertyId", &TranslateTimeline::getPropertyId)
        .function("setFrame", &TranslateTimeline::setFrame)
        .function("apply", &TranslateTimeline::apply, allow_raw_pointers());
    
    class_<ScaleTimeline, base<TranslateTimeline>>("ScaleTimeline")
        .constructor<int>()
        .function("getPropertyId", &ScaleTimeline::getPropertyId)
        .function("apply", &ScaleTimeline::apply, allow_raw_pointers());

    class_<ShearTimeline, base<TranslateTimeline>>("ScaleTimeline")
        .constructor<int>()
        .function("getPropertyId", &ShearTimeline::getPropertyId)
        .function("apply", &ShearTimeline::apply, allow_raw_pointers());

    class_<RotateTimeline>("RotateTimeline")
        .constructor<int>()
        // will wrap in js
        //static const int PREV_TIME = -2;
        //static const int PREV_ROTATION = -1;
        //static const int ROTATION = 1;
        .function("getProp_boneIndex", &RotateTimeline::getBoneIndex)
        .function("getProp_frames", &RotateTimeline::getFrames)
        .function("getPropertyId", &RotateTimeline::getPropertyId)
        .function("setFrame", &RotateTimeline::setFrame)
        .function("apply", &RotateTimeline::apply, allow_raw_pointers());

    class_<ColorTimeline>("ColorTimeline")
        .constructor<int>()
        // will wrap in js
        // static const int PREV_TIME;
        // static const int PREV_R;
        // static const int PREV_G;
        // static const int PREV_B;
        // static const int PREV_A;
        // static const int R;
        // static const int G;
        // static const int B;
        // static const int A;
        .function("getProp_slotIndex", &ColorTimeline::getSlotIndex)
        .function("getProp_frames", &ColorTimeline::getFrames)
        .function("getPropertyId", &ColorTimeline::getPropertyId)
        .function("setFrame", &ColorTimeline::setFrame)
        .function("apply", &ColorTimeline::apply, allow_raw_pointers()); 

    class_<TwoColorTimeline>("TwoColorTimeline")
        .constructor<int>()
        // static variables
        .function("getProp_slotIndex", &TwoColorTimeline::getSlotIndex)
        //.function("getProp_frames", &TwoColorTimeline::getFrames)
        .function("getPropertyId", &TwoColorTimeline::getPropertyId)
        .function("setFrame", &TwoColorTimeline::setFrame)
        .function("apply", &TwoColorTimeline::apply, allow_raw_pointers());

    class_<AttachmentTimeline>("AttachmentTimeline")
        .constructor<int>()
        .function("getProp_slotIndex", &AttachmentTimeline::getSlotIndex)
        .function("getProp_frames", &AttachmentTimeline::getFrames)
        .function("getProp_attachmentNames", &AttachmentTimeline::getAttachmentNames)
        .function("getPropertyId", &AttachmentTimeline::getPropertyId)
        .function("getFrameCount", &AttachmentTimeline::getFrameCount)
        .function("setFrame", &AttachmentTimeline::setFrame)
        .function("apply", &AttachmentTimeline::apply, allow_raw_pointers());
        //.function("setAttachment", &AttachmentTimeline::setAttachment) //have no setAttachment

    class_<DeformTimeline>("DeformTimeline")
        .constructor<int>()
        .function("getProp_slotIndex", &DeformTimeline::getSlotIndex)
        .function("getProp_attachment", &DeformTimeline::getAttachment, allow_raw_pointer<VertexAttachment>())
        .function("getProp_frames", &DeformTimeline::getFrames)
        .function("getProp_frameVertices", &DeformTimeline::getVertices)
        .function("getPropertyId", &DeformTimeline::getPropertyId)
        .function("setFrame", &DeformTimeline::setFrame)
        .function("apply", &DeformTimeline::apply, allow_raw_pointers());

    class_<EventTimeline>("EventTimeline")
        .constructor<int>()
        .function("getProp_frames", &EventTimeline::getFrames)
        .function("getProp_events", &EventTimeline::getEvents)
        .function("getPropertyId", &EventTimeline::getPropertyId)
        .function("getFrameCount", &EventTimeline::getFrameCount)
        .function("setFrame", &EventTimeline::setFrame, allow_raw_pointers())
        .function("apply", &EventTimeline::apply, allow_raw_pointers());

    class_<DrawOrderTimeline>("DrawOrderTimeline")
        .constructor<int>()
        .function("getProp_frames", &EventTimeline::getFrames)
        //.function("getProp_drawOrders", &EventTimeline::getDrawOrders)
        .function("getPropertyId", &DrawOrderTimeline::getPropertyId)
        .function("getFrameCount", &DrawOrderTimeline::getFrameCount)
        .function("setFrame", &DrawOrderTimeline::setFrame, allow_raw_pointers())
        .function("apply", &DrawOrderTimeline::apply, allow_raw_pointers());

    class_<IkConstraintTimeline>("IkConstraintTimeline")
        .constructor<int>()
        // static variables
        // .function("getProp_ikConstraintIndex", &EventTimeline::getFrames) // private
        // .function("getProp_frames", &IkConstraintTimeline::getFrames)
        .function("getPropertyId", &IkConstraintTimeline::getPropertyId)
        .function("setFrame", &IkConstraintTimeline::setFrame)
        .function("apply", &IkConstraintTimeline::apply, allow_raw_pointers());

    class_<TransformConstraintTimeline>("TransformConstraintTimeline")
        .constructor<int>()
        // static variables
        // .function("getProp_ikConstraintIndex", &TransformConstraintTimeline::getFrames) // private
        //.function("getProp_frames", &TransformConstraintTimeline::getFrames)
        .function("getPropertyId", &TransformConstraintTimeline::getPropertyId)
        .function("setFrame", &TransformConstraintTimeline::setFrame)
        .function("apply", &TransformConstraintTimeline::apply, allow_raw_pointers());

    class_<PathConstraintPositionTimeline>("PathConstraintPositionTimeline")
        .constructor<int>()
        // static variables
        // .function("getProp_ikConstraintIndex", &TransformConstraintTimeline::getFrames) // private
        //.function("getProp_frames", &TransformConstraintTimeline::getFrames)
        .function("getPropertyId", &PathConstraintPositionTimeline::getPropertyId)
        .function("setFrame", &PathConstraintPositionTimeline::setFrame)
        .function("apply", &PathConstraintPositionTimeline::apply, allow_raw_pointers());

    class_<PathConstraintMixTimeline>("PathConstraintMixTimeline")
        .constructor<int>()
        .function("getPropertyId", &PathConstraintMixTimeline::getPropertyId)
        .function("apply", &PathConstraintMixTimeline::apply, allow_raw_pointers());

    class_<TrackEntry>("TrackEntry")
        .constructor<>()
        .function("getProp_animation", &TrackEntry::getAnimation, allow_raw_pointer<Animation>())
        .function("getProp_next", &TrackEntry::getNext, allow_raw_pointer<TrackEntry>())
        .function("getProp_mixingFrom", &TrackEntry::getMixingFrom, allow_raw_pointer<TrackEntry>())
        .function("getProp_mixingTo", &TrackEntry::getMixingTo, allow_raw_pointer<TrackEntry>())
        //.function("getProp_listener", &TrackEntry::listener)
        .function("getProp_trackIndex", &TrackEntry::getTrackIndex)
        .function("getProp_loop", &TrackEntry::getLoop)
        .function("getProp_holdPrevious", &TrackEntry::getHoldPrevious)
        .function("getProp_eventThreshold", &TrackEntry::getEventThreshold)
        .function("getProp_attachmentThreshold", &TrackEntry::getAttachmentThreshold)
        .function("getProp_drawOrderThreshold", &TrackEntry::getDrawOrderThreshold)
        .function("getProp_animationStart", &TrackEntry::getAnimationStart)
        .function("getProp_animationEnd", &TrackEntry::getAnimationEnd)
        .function("getProp_animationLast", &TrackEntry::getAnimationLast)
        //.function("getProp_nextAnimationLast", &TrackEntry::nextAnimationLast)
        .function("getProp_delay", &TrackEntry::getDelay)
        .function("getProp_trackTime", &TrackEntry::getTrackTime)
        //.function("getProp_trackLast", &TrackEntry::trackLast)
        //.function("getProp_nextTrackLast", &TrackEntry::nextTrackLast)
        .function("getProp_trackEnd", &TrackEntry::getTrackEnd)
        .function("getProp_timeScale", &TrackEntry::getTimeScale)
        .function("getProp_alpha", &TrackEntry::getAlpha)
        .function("getProp_mixTime", &TrackEntry::getMixTime)
        .function("getProp_mixDuration", &TrackEntry::getMixDuration)
        //.function("getProp_interruptAlpha", &TrackEntry::_interruptAlpha)
        //.function("getProp_totalAlpha", &TrackEntry::getAlpha)
        .function("getProp_mixBlend", &TrackEntry::getMixBlend)
        //.function("getProp_timelineMode", &TrackEntry::timelineMode)
        //.function("getProp_timelineHoldMix", &TrackEntry::timelineHoldMix)
        //.function("getProp_timelinesRotation", &TrackEntry::timelinesRotation)
        //.function("reset", &TrackEntry::reset) //private
        .function("getAnimationTime", &TrackEntry::getAnimationTime)
        .function("setAnimationLast", &TrackEntry::setAnimationLast)
        .function("isComplete", &TrackEntry::isComplete)
        .function("resetRotationDirections", &TrackEntry::resetRotationDirections);

    class_<AnimationStateData>("AnimationStateData")
        .constructor<SkeletonData *>()
        .property("skeletonData", &AnimationStateData::getSkeletonData_Export)
        .property("defaultMix",&spine::AnimationStateData::getDefaultMix, &spine::AnimationStateData::setDefaultMix)

        .function("getProp_defaultMix", &AnimationStateData::getDefaultMix)
        .function("getProp_skeletonData", &AnimationStateData::getSkeletonData, allow_raw_pointers())
        // .function("setMix", static_cast<void (AnimationStateData::*)(const String&, const String&, float)>(&AnimationStateData::setMix))
        // .function("setMixWith", static_cast<void (AnimationStateData::*)(Animation*, Animation*, float)>(&AnimationStateData::setMix));
        .function("getMix", &AnimationStateData::getMix, allow_raw_pointers());
        
        // .function("setMixWith", &Skeleton::setMixWith_Export)
        //.function("getMix", &Skeleton::setMix_Export);

    class_<AnimationState>("AnimationState")
        .constructor<AnimationStateData *>()
        // static variables
        .property("data",&AnimationState::getData_Export)
        .property("timeScale",&AnimationState::getTimeScale, &AnimationState::setTimeScale)
        // .class_function("getProp_emptyAnimation",&AnimationState::getEmptyAnimation, allow_raw_pointers()) // private
        .function("getProp_data", &AnimationState::getData, allow_raw_pointers())
        .function("getProp_tracks", &AnimationState::getTracks, allow_raw_pointers())
        .function("getProp_timeScale", &AnimationState::getTimeScale)
        //.function("getProp_unkeyedState")
        //.function("getProp_events")
        //.function("getProp_listeners")
        //.function("getProp_queue")
        //.function("getProp_queue")
        //.function("getProp_propertyIDs", &AnimationState::getPropertyIDs)
        //.function("getProp_animationsChanged", &AnimationState::getAnimationsChanged)
        //.function("getProp_trackEntryPool", &AnimationState::getTrackEntryPool)
        .function("update", &AnimationState::update)
        //.function("updateMixingFrom", &AnimationState::updateMixingFrom, allow_raw_pointers()) //private
        .function("apply", &AnimationState::apply)
        // .function("applyMixingFrom", &AnimationState::applyMixingFrom, allow_raw_pointers()) //private
        //.function("applyAttachmentTimeline", &AnimationState::applyAttachmentTimeline) // have no
        //.function("setAttachment", &AnimationState::setAttachment) // have no
        // .class_function("applyRotateTimeline", &AnimationState::applyRotateTimeline, allow_raw_pointers())
        // .function("queueEvents", &AnimationState::queueEvents, allow_raw_pointers())
        .function("clearTracks", &AnimationState::clearTracks)
        .function("clearTrack", &AnimationState::clearTrack)
        // .function("setCurrent", &AnimationState::setCurrent, allow_raw_pointers())
        // .function("setAnimation", &AnimationState::setAnimation)
        // .function("setAnimationWith", &AnimationState::setAnimation)
        // .function("addAnimation", &AnimationState::addAnimation)
        // .function("addAnimationWith", &AnimationState::addAnimation)
        // .function("setEmptyAnimation", &AnimationState::setEmptyAnimation)
        // .function("addEmptyAnimation", &AnimationState::addEmptyAnimation, allow_raw_pointer<TrackEntry>())
        // .function("setEmptyAnimations", &AnimationState::setEmptyAnimations)
        //.function("expandToIndex", &AnimationState::expandToIndex, allow_raw_pointers()) // private        
        //.function("trackEntry", &AnimationState::newTrackEntry, allow_raw_pointers()) // private
        //.function("disposeNext", &AnimationState::disposeNext) // private
        //.function("_animationsChanged", &AnimationState::animationsChanged) // private
        //.function("computeHold", &AnimationState::computeHold, allow_raw_pointer<TrackEntry>()) // private
        .function("getCurrent", &AnimationState::getCurrent, allow_raw_pointer<TrackEntry>());
        //.function("addListener", &AnimationState::addListener)
        //.function("removeListener", &AnimationState::removeListener)
        //.function("clearListeners", &AnimationState::clearListeners) // no have clearListeners
        // .function("clearListenerNotifications", &AnimationState::clearListenerNotifications); // no have clearListenerNotifications

    class_<Animation>("Animation")
        .constructor<const String &, Vector<Timeline *> &, float>()
        .function("getProp_name", &Animation::getName)
        .function("getProp_timelines", &Animation::getTimelines)
        //.function("getProp_timelineIds", &Animation::getTimelines)
        .function("getProp_duration", &Animation::getDuration)
        .function("hasTimeline", &Animation::hasTimeline)
        .function("apply", &Animation::apply, allow_raw_pointers())
        // .class_function("binarySearch", &Animation::binarySearch)
        // .class_function("linearSearch", &Animation::linearSearch)
        ;

    // private
    // class_<EventQueue>("EventQueue")
    //     .constructor<AnimationState& , Pool<TrackEntry>& >()
    //     .function("start", &EventQueue::start, allow_raw_pointers())
    //     .function("interrupt", &EventQueue::interrupt, allow_raw_pointers())
    //     .function("end", &EventQueue::end, allow_raw_pointers())
    //     .function("dispose", &EventQueue::dispose, allow_raw_pointers())
    //     .function("complete", &EventQueue::complete, allow_raw_pointers())
    //     .function("event", &EventQueue::event, allow_raw_pointers())
    //     .function("drain", &EventQueue::drain)
    //     //.function("clear")

    // class_<AnimationStateListener>("AnimationStateListener")

    // class_<AnimationStateAdapter>("AnimationStateAdapter")

    register_vector<Bone *>("vector<Bone*>");
    class_<Skeleton>("Skeleton")
        .constructor<SkeletonData *>()
        .property("skin", &Skeleton::getSkin_Export)
        .property("data", &Skeleton::getData_Export)
        .function("getBones", &Skeleton::getBones_Export)
        .function("setToSetupPose", &Skeleton::setToSetupPose)
        .function("setBonesToSetupPose", &Skeleton::setBonesToSetupPose)
        .function("setSlotsToSetupPose", &Skeleton::setSlotsToSetupPose)
        .function("updateWorldTransform", &Skeleton::updateWorldTransform);

    class_<VertexEffect>("VertexEffect")
        .function("begin", &VertexEffect::begin, pure_virtual())
        //.function("transform", &VertexEffect::transform, pure_virtual())
        .function("end", &VertexEffect::end, pure_virtual());

    class_<JitterVertexEffect, base<VertexEffect>>("JitterEffect")
        .constructor<float, float>()
        .property("jitterX", &JitterVertexEffect::getJitterX, &JitterVertexEffect::setJitterX)
        .property("jitterY", &JitterVertexEffect::getJitterY, &JitterVertexEffect::setJitterY)
        .function("begin", &JitterVertexEffect::begin)
        //.function("transform", &JitterVertexEffect::transform)
        .function("end", &JitterVertexEffect::end);

    class_<SwirlVertexEffect, base<VertexEffect>>("SwirlEffect")
        .constructor<float, Interpolation &>()
        .property("centerX", &SwirlVertexEffect::getCenterX, &SwirlVertexEffect::setCenterX)
        .property("centerY", &SwirlVertexEffect::getCenterY, &SwirlVertexEffect::setCenterY)
        .property("radius", &SwirlVertexEffect::getRadius, &SwirlVertexEffect::setRadius)
        .property("angle", &SwirlVertexEffect::getAngle, &SwirlVertexEffect::setAngle)
        .function("begin", &SwirlVertexEffect::begin)
        //.function("transform", &SwirlVertexEffect::transform)
        .function("end", &SwirlVertexEffect::end);

    class_<SlotMesh>("SlotMesh")
        .property("vCount", &SlotMesh::vCount)
        .property("iCount", &SlotMesh::iCount)
        .property("blendMode", &SlotMesh::blendMode);

    register_vector<SlotMesh>("vector<SlotMesh>");
    class_<SpineModel>("SpineModel")
        .property("vCount", &SpineModel::vCount)
        .property("iCount", &SpineModel::iCount)
        .property("vPtr", &SpineModel::vPtr)
        .property("iPtr", &SpineModel::iPtr)
        .function("getMeshes", &SpineModel::getMeshes);


    class_<SpineSkeletonInstance>("SkeletonInstance")
        .constructor<>()
        .function("initSkeletonDataJson", &SpineSkeletonInstance::initSkeletonDataJson, allow_raw_pointer<SkeletonData>())
        .function("initSkeleton", &SpineSkeletonInstance::initSkeleton, allow_raw_pointer<Skeleton>())
        .function("setAnimation", &SpineSkeletonInstance::setAnimation)
        .function("setSkin", &SpineSkeletonInstance::setSkin)
        .function("updateAnimation", &SpineSkeletonInstance::updateAnimation)
        .function("updateRenderData", &SpineSkeletonInstance::updateRenderData, allow_raw_pointer<SpineModel>())
        .function("setPremultipliedAlpha", &SpineSkeletonInstance::setPremultipliedAlpha)
        .function("setUseTint", &SpineSkeletonInstance::setUseTint)
        .function("setColor", &SpineSkeletonInstance::setColor)
        .function("setJitterEffect", &SpineSkeletonInstance::setJitterEffect, allow_raw_pointer<JitterVertexEffect*>())
        .function("setSwirlEffect", &SpineSkeletonInstance::setSwirlEffect, allow_raw_pointer<SwirlVertexEffect*>())
        .function("clearEffect", &SpineSkeletonInstance::clearEffect)
        .function("getAnimationState", &SpineSkeletonInstance::getAnimationState, allow_raw_pointer<AnimationState>())
        .function("setMix", &SpineSkeletonInstance::setMix)
        .function("setStartListener", &SpineSkeletonInstance::setStartListener)
        ;
}