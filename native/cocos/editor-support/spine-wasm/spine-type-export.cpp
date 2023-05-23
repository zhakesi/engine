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

    class_<Color>("Color")
        .constructor<>()
        .constructor<float, float, float, float>()
        .function("set", static_cast<Color&(Color::*)(float, float, float, float)>(&Color::set))
        .function("setFromColor", static_cast<Color&(Color::*)(const Color&)>(&Color::set))
        .function("add", static_cast<Color&(Color::*)(float, float, float, float)>(&Color::add))
        .function("clamp", &Color::clamp)
        .property("r", &Color::r)
        .property("g", &Color::g)
        .property("b", &Color::b)
        .property("a", &Color::a);

    class_<Interpolation>("Interpolation")
        .function("apply", &Interpolation::apply, pure_virtual());

    class_<PowInterpolation, base<Interpolation>>("Pow")
        .constructor<int>()
        .function("apply", &PowInterpolation::apply);
    
    class_<PowOutInterpolation, base<Interpolation>>("PowOut")
        .constructor<int>()
        .function("apply", &PowInterpolation::apply);
 
    class_<Vector2>("Vector2")
        .constructor<float, float>()
        .function("set", static_cast<Vector2&(Vector2::*)(float, float)>(&Vector2::set))
        .function("length", &Vector2::length)
        .function("normalize", static_cast<Vector2&(Vector2::*)()>(&Vector2::normalize))
        .property("x", &Vector2::x)
        .property("y", &Vector2::y);

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
        .property("skinRequired", &BoneData::isSkinRequired, &BoneData::setSkinRequired);
    
    class_<SlotData>("SlotData")
        .constructor<int, const String&, BoneData &>()
        .function("index", select_overload<int()>(&SlotData::getIndex))
        .function("name", select_overload<const String &()>(&SlotData::getName))
        .function("boneData", select_overload<BoneData &()>(&SlotData::getBoneData))
        .function("color", select_overload<Color &()>(&SlotData::getColor))
        .function("darkColor", select_overload<Color &()>(&SlotData::getDarkColor))
        .function("attachmentName", select_overload<const String &()>(&SlotData::getAttachmentName))
        .function("attachmentName", select_overload<void(const String &)>(&SlotData::setAttachmentName))
        .function("blendMode", select_overload<BlendMode()>(&SlotData::getBlendMode))
        .function("blendMode", select_overload<void (BlendMode)>(&SlotData::setBlendMode));

    class_<Bone>("Bone")
        .constructor<BoneData &, Skeleton &, Bone *>()
        .property("a", &Bone::getA, &Bone::setA)
        .property("b", &Bone::getB, &Bone::setB)
        .property("c", &Bone::getC, &Bone::setC)
        .property("d", &Bone::getD, &Bone::setD)
        .property("worldX", &Bone::getWorldX, &Bone::setWorldX)
        .property("worldY", &Bone::getWorldY, &Bone::setWorldY)
        .property("data", &Bone::getData)
        .function("getParent", &Bone::getParent_Export, allow_raw_pointer<Bone>());


    class_<Skin>("Skin")
        .constructor<const String&>()
        .property("name", &Skin::getName_Export)
        .function("attachments", select_overload<Skin::AttachmentMap::Entries()>(&Skin::getAttachments))
        .function("bones", select_overload<Vector<BoneData *> &()>(&Skin::getBones))
        .function("constraints", select_overload<Vector<ConstraintData *> &()>(&Skin::getConstraints))
        .function("setAttachment", select_overload<void(size_t, const String &, Attachment *)>(&Skin::setAttachment), allow_raw_pointers())
        .function("addSkin", select_overload<void(Skin *)>(&Skin::addSkin), allow_raw_pointers())
        .function("copySkin", select_overload<void(Skin *)>(&Skin::copySkin), allow_raw_pointers())
        .function("getAttachments", select_overload<Skin::AttachmentMap::Entries ()>(&Skin::getAttachments))
        .function("removeAttachment", select_overload<void(size_t, const String &)>(&Skin::removeAttachment))
        .function("getAttachmentsForSlot", select_overload<void(size_t, Vector<Attachment *> &)>(&Skin::findAttachmentsForSlot), allow_raw_pointers())
        .function("attachAll", select_overload<void(Skeleton &skeleton, Skin &oldSkin)>(&Skin::attachAll));

    class_<Skin::AttachmentMap::Entry>("SkinEntry")
        .constructor<size_t, const String &, Attachment *>()
        .property("slotIndex", &Skin::AttachmentMap::Entry::_slotIndex)
        .property("name", &Skin::AttachmentMap::Entry::_name)
        .function("attachment", select_overload<Attachment *()>(&Skin::AttachmentMap::Entry::getAttachment), allow_raw_pointers())
        .function("attachment", select_overload<void(Attachment *)>(&Skin::AttachmentMap::Entry::setAttachment), allow_raw_pointers());

    class_<SkeletonData>("SkeletonData")
        .constructor<>()
        .property("width",&spine::SkeletonData::getWidth, &spine::SkeletonData::setWidth)
        .property("height",&spine::SkeletonData::getHeight, &spine::SkeletonData::setHeight);

    class_<TrackEntry>("TrackEntry")
        .constructor<>();


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