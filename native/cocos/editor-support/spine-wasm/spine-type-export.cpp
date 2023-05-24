#include <spine/spine.h>
#include "spine-skeleton-instance.h"
#include <emscripten/bind.h>
#include <memory>
#include <spine/Vector.h>

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
        .value("twoColor", TimelineType_TwoColor);\
    
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
        .function("setMix", &AnimationStateData::setMix_Export);
        // .function("setMixWith", &Skeleton::setMixWith_Export)
        //.function("getMix", &Skeleton::setMix_Export);
    
    class_<AnimationState>("AnimationState")
        .constructor<AnimationStateData *>()
        .property("data",&AnimationState::getData_Export)
        .property("timeScale",&AnimationState::getTimeScale, &AnimationState::setTimeScale)
        .function("update", &AnimationState::update)
        .function("clearTrack", &AnimationState::clearTrack)
        .function("clearTracks", &AnimationState::clearTracks);

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