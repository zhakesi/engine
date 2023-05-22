#include <spine/spine.h>
#include "spine-skeleton-instance.h"
#include <emscripten/bind.h>

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

    class_<PowInterpolation>("Pow")
        .constructor<int>()
        .function("apply", &PowInterpolation::apply);
    
    class_<PowOutInterpolation>("PowOut")
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
        .function("index", select_overload<int()>(&BoneData::getIndex))
        .function("name", select_overload<const String &()>(&BoneData::getName))
        .function("parent", select_overload<BoneData *()>(&BoneData::getParent), allow_raw_pointers())
        .function("length", select_overload<float()>(&BoneData::getLength))
        .function("x", select_overload<float()>(&BoneData::getX))
        .function("x", select_overload<void(float)>(&BoneData::setX))
        .function("y", select_overload<float()>(&BoneData::getY))
        .function("y", select_overload<void(float)>(&BoneData::setY))
        .function("rotation", select_overload<float()>(&BoneData::getRotation))
        .function("rotation", select_overload<void(float)>(&BoneData::setRotation))
        .function("scaleX", select_overload<float()>(&BoneData::getScaleX))
        .function("scaleX", select_overload<void(float)>(&BoneData::setScaleX))
        .function("scaleY", select_overload<float()>(&BoneData::getScaleY))
        .function("scaleY", select_overload<void(float)>(&BoneData::setScaleY))
        .function("shearX", select_overload<float()>(&BoneData::getShearX))
        .function("shearX", select_overload<void(float)>(&BoneData::setShearX))
        .function("shearY", select_overload<float()>(&BoneData::getShearY))
        .function("shearY", select_overload<void(float)>(&BoneData::setShearY))
        .function("transformMode", select_overload<TransformMode()>(&BoneData::getTransformMode))
        .function("transformMode", select_overload<void(TransformMode)>(&BoneData::setTransformMode))
        .function("skinRequired", select_overload<bool()>(&BoneData::isSkinRequired))
        .function("skinRequired", select_overload<void(bool)>(&BoneData::setSkinRequired));
    
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
    class_<SkeletonData>("SkeletonData")
        .constructor<>()
        .property("width",&spine::SkeletonData::getWidth, &spine::SkeletonData::setWidth)
        .property("height",&spine::SkeletonData::getHeight, &spine::SkeletonData::setHeight);
    
    class_<AnimationStateData>("AnimationStateData")
        .constructor<SkeletonData *>()
        .property("defaultMix",&spine::AnimationStateData::getDefaultMix, &spine::AnimationStateData::setDefaultMix);
    
    class_<AnimationState>("AnimationState")
        .constructor<AnimationStateData *>()
        .property("timeScale",&spine::AnimationState::getTimeScale, &spine::AnimationState::setTimeScale);
    
    class_<Skeleton>("Skeleton")
        .constructor<SkeletonData *>()
        .function("data", &Skeleton::getData, allow_raw_pointer<SkeletonData>())
        .property("skin", &Skeleton::getSkin_Export);
   
////////////////////////////////////////////////////////////////////////////////////////////////////////////

    class_<JitterVertexEffect>("JitterEffect")
        .constructor<float, float>()
        .function("index", select_overload<float()>(&JitterVertexEffect::getJitterX))
        .function("jitterX", select_overload<void(float)>(&JitterVertexEffect::setJitterX))
        .function("jitterY", select_overload<float()>(&JitterVertexEffect::getJitterY))
        .function("jitterY", select_overload<void(float)>(&JitterVertexEffect::setJitterY))
        .function("end", &JitterVertexEffect::end);

    class_<SwirlVertexEffect>("SwirlEffect")
        //.constructor<float, PowInterpolation &>()
        .constructor<float, PowOutInterpolation &>()
        .property("centerX", &SwirlVertexEffect::getCenterX, &SwirlVertexEffect::setCenterX)
        .property("centerY", &SwirlVertexEffect::getCenterY, &SwirlVertexEffect::setCenterY)
        .property("radius", &SwirlVertexEffect::getRadius, &SwirlVertexEffect::setRadius)
        .property("angle", &SwirlVertexEffect::getAngle, &SwirlVertexEffect::setAngle)
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
        .function("setColor", &SpineSkeletonInstance::setColor)
        .function("setJitterEffect", &SpineSkeletonInstance::setJitterEffect, allow_raw_pointer<JitterVertexEffect*>())
        .function("setSwirlEffect", &SpineSkeletonInstance::setSwirlEffect, allow_raw_pointer<SwirlVertexEffect*>())
        .function("clearEffect", &SpineSkeletonInstance::clearEffect);
}