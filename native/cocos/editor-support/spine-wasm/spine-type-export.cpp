#include <spine/spine.h>
#include "spine-wasm.h"
#include "spine-skeleton-instance.h"
#include <emscripten/bind.h>
#include <memory>
#include <vector>
#include <functional>

using namespace emscripten;
using namespace spine;

std::string convertSPString2std(const spine::String& str) {
    std::string stdStr(str.buffer(), str.length());
    return stdStr;
}

const spine::String convertStd2SPString(std::string& str) {
    const spine::String spString(str.c_str(), str.length());
    return spString;
}

template <typename T>
std::vector<T> convertSPVector2Std(Vector<T> &container) {
    int count = container.size();
    std::vector<T> stdVector(count);
    for (int i = 0; i < count; i++) {
        stdVector[i] = container[i];
    }
    return stdVector;
}

template <typename T>
std::vector<T> convertSPVector2Std_2(Vector<T> container) {
    int count = container.size();
    std::vector<T> stdVector(count);
    for (int i = 0; i < count; i++) {
        stdVector[i] = container[i];
    }
    return stdVector;
}

EMSCRIPTEN_BINDINGS(spine) {
    register_vector<float>("VectorFloat");
    register_vector<BoneData*>("VectorBoneData");
    register_vector<Bone*>("VectorBone");
    register_vector<SlotData*>("VectorSlotData");
    register_vector<Slot*>("VectorSlot");
    register_vector<Animation*>("VectorAnimation");
    register_vector<Skin*>("VectorSkin");
    register_vector<EventData*>("VectorEventData");
    register_vector<Event*>("VectorEvent");
    register_vector<ConstraintData*>("VectorConstraintData");
    register_vector<IkConstraint*>("VectorIkConstraint");
    register_vector<PathConstraint*>("VectorPathConstraint");
    register_vector<TransformConstraint*>("VectorTransformConstraint");
    register_vector<IkConstraintData*>("VectorIkConstraintData");
    register_vector<TransformConstraintData*>("VectorTransformConstraintData");
    register_vector<PathConstraintData*>("VectorPathConstraintData");
    register_vector<TrackEntry*>("VectorTrackEntry");

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

    // class_<Pool>("Pool")
    //     .constructor<>();

    class_<MathUtil>("MathUtils")
        .class_property("PI", &MathUtil::Pi)
        .class_property("PI2", &MathUtil::Pi_2)
        //.class_property("radiansToDegrees", &MathUtil::radiansToDegrees)
        .class_property("radDeg", &MathUtil::Rad_Deg)
        //.class_property("degreesToRadians", &MathUtil::degreesToRadians)
        .class_function("clamp", &MathUtil::clamp)
        .class_function("cosDeg", &MathUtil::cosDeg)
        .class_function("cosDeg", &MathUtil::cosDeg)
        .class_function("sinDeg", &MathUtil::sinDeg)
        .class_function("signum", &MathUtil::sign);
        //.class_function("toInt", &MathUtil::toInt)
        //.class_function("cbrt", &MathUtil::randomTriangular)
        //.class_function("randomTriangular", &MathUtil::randomTriangular)
        //.class_function("randomTriangularWith", &MathUtil::randomTriangular);

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


    class_<Triangulator>("Triangulator")
        .constructor<>()
        .function("triangulate", &Triangulator::triangulate)
        .function("decompose", &Triangulator::decompose, allow_raw_pointers());


    class_<ConstraintData>("ConstraintData")
        .constructor<const String& >()
        .function("getProp_name", optional_override([](ConstraintData &obj) { return convertSPString2std(obj.getName());}))
        .function("getProp_order", &ConstraintData::getOrder)
        .function("getProp_skinRequired", &ConstraintData::isSkinRequired);

    class_<IkConstraintData, base<ConstraintData>>("IkConstraintData")
        .constructor<const String& >()
        .function("getProp_bones", optional_override([](IkConstraintData &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_target", &IkConstraintData::getTarget, allow_raw_pointer<BoneData>())
        .function("getProp_bendDirection", &IkConstraintData::getBendDirection)
        .function("getProp_compress", &IkConstraintData::getCompress)
        .function("getProp_stretch", &IkConstraintData::getStretch)
        .function("getProp_uniform", &IkConstraintData::getUniform)
        .function("getProp_mix", &IkConstraintData::getMix)
        .function("getProp_softness", &IkConstraintData::getSoftness);

    class_<PathConstraintData, base<ConstraintData>>("PathConstraintData")
        .constructor<const String& >()
        .function("getProp_bones", optional_override([](PathConstraintData &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_target", &PathConstraintData::getTarget, allow_raw_pointer<SlotData>())
        .function("getProp_positionMode", &PathConstraintData::getPositionMode)
        .function("getProp_spacingMode", &PathConstraintData::getSpacingMode)
        .function("getProp_rotateMode", &PathConstraintData::getRotateMode)
        .function("getProp_offsetRotation", &PathConstraintData::getOffsetRotation)
        .function("getProp_position", &PathConstraintData::getPosition)
        .function("getProp_spacing", &PathConstraintData::getSpacing)
        .function("getProp_rotateMix", &PathConstraintData::getRotateMix)
        .function("getProp_translateMix", &PathConstraintData::getTranslateMix);

    class_<SkeletonBounds>("SkeletonBounds")
        //.function("getProp_minX", &SkeletonBounds::minX)
        //.function("getProp_minY", &SkeletonBounds::minY)
        //.function("getProp_maxX", &SkeletonBounds::maxX)
        //.function("getProp_maxY", &SkeletonBounds::maxY)
        //.function("getProp_boundingBoxes", &SkeletonBounds::boundingBoxes)
        //.function("getProp_polygons", &SkeletonBounds::polygons)
        .function("update", &SkeletonBounds::update)
        //.function("aabbCompute", &SkeletonBounds::aabbCompute) // private
        .function("aabbContainsPoint", &SkeletonBounds::aabbcontainsPoint)
        .function("aabbIntersectsSegment", &SkeletonBounds::aabbintersectsSegment)
        .function("aabbIntersectsSkeleton", &SkeletonBounds::aabbIntersectsSkeleton)
        //.function("containsPoint", select_overload<void(float, float)>(&SkeletonBounds::containsPoint), allow_raw_pointers())
        //.function("containsPointPolygon", select_overload<void(Polygon*, float, float)>(&SkeletonBounds::containsPoint), allow_raw_pointers())
        //.function("intersectsSegment", select_overload<void(float, float, float, float)>(&SkeletonBounds::intersectsSegment))
        //.function("intersectsSegmentPolygon", select_overload<void(spine::Polygon*, float, float, float, float)>(&SkeletonBounds::intersectsSegment), allow_raw_pointers())
        .function("getPolygon", &SkeletonBounds::getPolygon, allow_raw_pointers())
        .function("getWidth", &SkeletonBounds::getWidth)
        .function("getHeight", &SkeletonBounds::getHeight);

    class_<Event>("Event")
        .constructor<float , const EventData &>()
        .function("getProp_data", &Event::getData)
        .function("getProp_intValue", &Event::getIntValue)
        .function("getProp_floatValue", &Event::getFloatValue)
        .function("getProp_stringValue",optional_override([](Event &obj) { return convertSPString2std(obj.getStringValue());}))
        .function("getProp_time", &Event::getTime)
        .function("getProp_volume", &Event::getVolume)
        .function("getProp_balance", &Event::getBalance); 

    class_<EventData>("EventData")
        .constructor<const String &>()
        .function("getProp_name", optional_override([](EventData &obj) { return convertSPString2std(obj.getName());}))
        .function("getProp_intValue", &EventData::getIntValue)
        .function("getProp_floatValue", &EventData::getFloatValue)
        .function("getProp_stringValue", optional_override([](EventData &obj) { return convertSPString2std(obj.getStringValue());}))
        .function("getProp_audioPath", optional_override([](EventData &obj) { return convertSPString2std(obj.getAudioPath());}))
        .function("getProp_volume", &EventData::getVolume)
        .function("getProp_balance", &EventData::getBalance);
    

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
        .function("getProp_name", optional_override([](BoundingBoxAttachment &obj) { return convertSPString2std(obj.getName());}))
        .function("copy", &BoundingBoxAttachment::copy, allow_raw_pointers());
        //.function("getProp_color", &BoundingBoxAttachment::getColor)

    class_<ClippingAttachment>("ClippingAttachment")
        .constructor<const String& >()
        .function("getProp_endSlot", &ClippingAttachment::getEndSlot, allow_raw_pointer<SlotData>())
        .function("copy", &ClippingAttachment::copy, allow_raw_pointer<Attachment>());
        //.function("getProp_color", &ClippingAttachment::getColor)

    class_<MeshAttachment>("MeshAttachment")
        .constructor<const String& >()
        //.function("getProp_region", &MeshAttachment::getRegion)
        .function("getProp_path", optional_override([](MeshAttachment &obj) { return convertSPString2std(obj.getPath());}))
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
        .function("getProp_lengths", optional_override([](PathAttachment &obj) { return convertSPVector2Std(obj.getLengths());}))
        .function("getProp_closed", &PathAttachment::isClosed)
        .function("getProp_constantSpeed", &PathAttachment::isConstantSpeed)
        //.function("getProp_color", &MeshAttachment::getColor) // no color
        .function("copy", &PathAttachment::copy, allow_raw_pointers());

    class_<PointAttachment>("PointAttachment")
        .constructor<const String& >()
        .function("getProp_x", &PointAttachment::getX)
        .function("getProp_y", &PointAttachment::getY)
        .function("getProp_rotation", &PointAttachment::getRotation)
        //.function("computeWorldPosition", &PointAttachment::computeWorldPosition) //reference type
        .function("computeWorldRotation", &PointAttachment::computeWorldRotation)
        //.function("getProp_color", &PointAttachment::getColor) // no color
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
        .function("getProp_path", optional_override([](RegionAttachment &obj) { return convertSPString2std(obj.getPath());}))
        .function("getProp_rendererObject", &RegionAttachment::getRendererObject, allow_raw_pointer<void>())
        //.function("getProp_region", &PointAttachment::getRegion)
        .function("getProp_offset", &RegionAttachment::getOffset)
        .function("getProp_uvs", &RegionAttachment::getUVs)
        //.function("getProp_tempColor", &PointAttachment::getTempColor) // have no tempColor
        .function("updateOffset", &RegionAttachment::updateOffset)
        //.function("setRegion", &RegionAttachment::setRegion) // have no setRegion
        .function("copy", &RegionAttachment::copy, allow_raw_pointer<Attachment>());


    // class_<AttachmentLoader>("AttachmentLoader")
    //     .constructor<>()
    //     .function("newClippingAttachment", &AttachmentLoader::newClippingAttachment, pure_virtual(), allow_raw_pointer<ClippingAttachment>())
    //     .function("newPointAttachment", &AttachmentLoader::newPointAttachment, pure_virtual(), allow_raw_pointer<PointAttachment>())
    //     .function("newPathAttachment", &AttachmentLoader::newPathAttachment, pure_virtual(), allow_raw_pointer<PathAttachment>())
    //     .function("newBoundingBoxAttachment", &AttachmentLoader::newBoundingBoxAttachment, pure_virtual(), allow_raw_pointer<BoundingBoxAttachment>())
    //     .function("newMeshAttachment", &AttachmentLoader::newMeshAttachment, pure_virtual(), allow_raw_pointer<MeshAttachment>())
    //     .function("newRegionAttachment", &AttachmentLoader::newRegionAttachment, pure_virtual(), allow_raw_pointer<RegionAttachment>());


    class_<AtlasAttachmentLoader, base<AttachmentLoader>>("AtlasAttachmentLoader")
        .constructor<Atlas* >()
        .function("newRegionAttachment", &AtlasAttachmentLoader::newRegionAttachment, allow_raw_pointer<RegionAttachment>())
        .function("newMeshAttachment", &AtlasAttachmentLoader::newMeshAttachment, allow_raw_pointer<MeshAttachment>())
        .function("newBoundingBoxAttachment", &AtlasAttachmentLoader::newBoundingBoxAttachment, allow_raw_pointer<BoundingBoxAttachment>())
        .function("newPathAttachment", &AtlasAttachmentLoader::newPathAttachment, allow_raw_pointer<PathAttachment>())
        .function("newPointAttachment", &AtlasAttachmentLoader::newPointAttachment, allow_raw_pointer<PointAttachment>())
        .function("newClippingAttachment", &AtlasAttachmentLoader::newClippingAttachment, allow_raw_pointer<ClippingAttachment>());
        //.function("getProp_atlas")

    class_<AtlasPage>("TextureAtlasPage")
        .constructor<const String&>()
        .function("getProp_name", optional_override([](AtlasPage &obj) { return convertSPString2std((const String)obj.name);}))
        .property("minFilter", &AtlasPage::minFilter)
        .property("magFilter", &AtlasPage::magFilter)
        .property("uWrap", &AtlasPage::uWrap)
        .property("vWrap", &AtlasPage::vWrap)
        //.property("texture", &AtlasPage::texture) // no texture, use renderer object
        .property("width", &AtlasPage::width)
        .property("height", &AtlasPage::height);

    class_<AtlasRegion>("TextureAtlasRegion")
        //.property("page", &AtlasRegion::page)
        .function("getProp_name", optional_override([](AtlasRegion &obj) { return convertSPString2std((const String)obj.name);}))
        .property("x", &AtlasRegion::x)
        .property("y", &AtlasRegion::y)
        .property("index", &AtlasRegion::index)
        .property("rotate", &AtlasRegion::rotate)
        .property("degrees", &AtlasRegion::degrees);
        //.property("texture", &AtlasRegion::height)


    class_<Atlas>("TextureAtlas")
        .constructor<const String&, TextureLoader*, bool>()
        //.function("getProp_pages")
        //.function("getProp_regions")
        .function("findRegion", &Atlas::findRegion, allow_raw_pointer<AtlasRegion>());
        //.function("dispose");

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
        .function("getProp_index", &BoneData::getIndex)
        .function("getProp_name", optional_override([](BoneData &obj) { return convertSPString2std(obj.getName());}))
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
        .function("getProp_name", optional_override([](SlotData &obj) { return convertSPString2std(obj.getName());}))
        .function("getProp_boneData", &SlotData::getBoneData)
        .function("getProp_color", &SlotData::getColor)
        .function("getProp_darkColor", &SlotData::getDarkColor)
        .function("getProp_blendMode", &SlotData::getBlendMode);
        
    class_<Updatable>("Updatable")
        .function("update", &Updatable::update, pure_virtual())
        .function("isActive", &Updatable::isActive, pure_virtual());

    class_<IkConstraint, base<Updatable>>("IkConstraint")
        .constructor<IkConstraintData &, Skeleton &>()
        .function("getProp_data",  &IkConstraint::getData)
        .function("getProp_bones", optional_override([](IkConstraint &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_target",  &IkConstraint::getTarget, allow_raw_pointer<Bone>())
        .function("getProp_bendDirection",  &IkConstraint::getBendDirection)
        .function("getProp_compress",  &IkConstraint::getCompress)
        .function("getProp_stretch",  &IkConstraint::getStretch)
        .function("getProp_mix",  &IkConstraint::getMix)
        .function("getProp_softness",  &IkConstraint::getSoftness)
        .function("getProp_active",  &IkConstraint::isActive)
        .function("isActive",  &IkConstraint::isActive)
        .function("apply", static_cast<void(IkConstraint::*)()>(&IkConstraint::apply))
        .function("update", &IkConstraint::update)
        //.function("apply1", static_cast<void(Updatable::*)(Bone &, float, float, bool, bool, bool, float)>(&IkConstraint::apply))
        //.function("apply2", static_cast<void(IkConstraint::*)(Bone &, Bone &, float, float, int, bool, float, float)>(&IkConstraint::apply))
        ;

    class_<PathConstraint, base<Updatable>>("PathConstraint")
        .constructor<PathConstraintData&, Skeleton&>()
        // private but no need, just wrap in js
        // static const float EPSILON;
        // static const int NONE;
        // static const int BEFORE;
        // static const int AFTER;
        .function("getProp_data",  &PathConstraint::getData)
        .function("getProp_bones", optional_override([](PathConstraint &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_target",  &PathConstraint::getTarget, allow_raw_pointer<Slot>())
        .function("getProp_position",  &PathConstraint::getPosition)
        .function("getProp_spacing",  &PathConstraint::getSpacing)
        .function("getProp_rotateMix",  &PathConstraint::getRotateMix)
        .function("getProp_translateMix",  &PathConstraint::getTranslateMix)
        //.function("getProp_spaces",  &PathConstraint::spaces)
        //.function("getProp_positions",  &PathConstraint::positions)
        //.function("getProp_world",  &PathConstraint::world)
        //.function("getProp_curves",  &PathConstraint::curves)
        //.function("getProp_lengths",  &PathConstraint::lengths)
        //.function("getProp_segments",  &PathConstraint::segments)
        .function("getProp_active",  &PathConstraint::isActive)
        .function("isActive",  &PathConstraint::isActive)
        .function("apply",  &PathConstraint::apply)
        .function("update",  &PathConstraint::update)
        //.function("computeWorldPositions",  &PathConstraint::computeWorldPositions)
        //.function("addBeforePosition",  &PathConstraint::addBeforePosition)
        //.function("addAfterPosition",  &PathConstraint::addAfterPosition)
        //.function("addCurvePosition",  &PathConstraint::addCurvePosition) // private
        ;

    class_<TransformConstraintData, base<ConstraintData>>("TransformConstraintData")
        .constructor<const String&>()
        .function("getProp_bones", optional_override([](TransformConstraintData &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_target", &TransformConstraintData::getTarget, allow_raw_pointer<BoneData>())
        .function("getProp_rotateMix", &TransformConstraintData::getRotateMix)
        .function("getProp_translateMix", &TransformConstraintData::getTranslateMix)
        .function("getProp_scaleMix", &TransformConstraintData::getScaleMix)
        .function("getProp_shearMix", &TransformConstraintData::getShearMix)
        .function("getProp_offsetRotation", &TransformConstraintData::getOffsetRotation)
        .function("getProp_offsetX", &TransformConstraintData::getOffsetX)
        .function("getProp_offsetY", &TransformConstraintData::getOffsetY)
        .function("getProp_offsetScaleX", &TransformConstraintData::getOffsetScaleX)
        .function("getProp_offsetScaleY", &TransformConstraintData::getOffsetScaleY)
        .function("getProp_offsetShearY", &TransformConstraintData::getOffsetShearY)
        .function("getProp_relative", &TransformConstraintData::isRelative)
        .function("getProp_local", &TransformConstraintData::isLocal);

    class_<TransformConstraint, base<Updatable>>("TransformConstraint")
        .constructor<TransformConstraintData &, Skeleton &>()
        .function("getProp_data", &TransformConstraint::getData)
        .function("getProp_bones", optional_override([](TransformConstraint &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_target", &TransformConstraint::getTarget, allow_raw_pointer<Bone>())
        .function("getProp_rotateMix", &TransformConstraint::getRotateMix)
        .function("getProp_translateMix", &TransformConstraint::getTranslateMix)
        .function("getProp_scaleMix", &TransformConstraint::getScaleMix)
        .function("getProp_shearMix", &TransformConstraint::getShearMix)
        //.function("getProp_temp") // no
        .function("getProp_active", &TransformConstraint::isActive)
        .function("isActive", &TransformConstraint::isActive)
        .function("apply", &TransformConstraint::apply)
        .function("update", &TransformConstraint::update);
        //.function("applyAbsoluteWorld", &TransformConstraint::applyAbsoluteWorld)
        //.function("applyRelativeWorld", &TransformConstraint::applyRelativeWorld)
        //.function("applyAbsoluteLocal", &TransformConstraint::applyAbsoluteLocal)
        //.function("applyRelativeLocal", &TransformConstraint::applyRelativeLocal)


    class_<Bone, base<Updatable>>("Bone")
        .constructor<BoneData &, Skeleton &, Bone *>()
        .function("getProp_data", &Bone::getData)
        .function("getProp_skeleton", &Bone::getSkeleton)
        .function("getProp_parent", &Bone::getParent, allow_raw_pointers())
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
        .function("getProp_name", optional_override([](Skin &obj) { return convertSPString2std(obj.getName());}))
        .function("getProp_attachments", &Skin::getAttachments)
        .function("getProp_bones", optional_override([](Skin &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_constraints", optional_override([](Skin &obj) { return convertSPVector2Std(obj.getConstraints());}), allow_raw_pointers())
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
        .function("getProp_name", optional_override([](Skin::AttachmentMap::Entry &obj) { return convertSPString2std((const String)obj._name);}))
        .function("getProp_attachment", &Skin::AttachmentMap::Entry::getAttachment, allow_raw_pointers());

    class_<SkeletonClipping>("SkeletonClipping")
        .constructor<>()
        .function("getProp_clippedVertices", &SkeletonClipping::getClippedVertices)
        .function("getProp_clippedTriangles", &SkeletonClipping::getClippedTriangles)
        .function("getProp_UVs", &SkeletonClipping::getClippedUVs)
        .function("clipStart", &SkeletonClipping::clipStart, allow_raw_pointers())
        .function("clipEndWithSlot", select_overload<void(Slot&)>(&SkeletonClipping::clipEnd))
        .function("clipEnd", select_overload<void()>(&SkeletonClipping::clipEnd))
        .function("isClipping", &SkeletonClipping::isClipping);
        //.function("clipTriangles", &SkeletonClipping::clipTriangles, allow_raw_pointers()); //paramters not match
        //.function("clip", &SkeletonClipping::clip)
        //.class_function("makeClockwise", &SkeletonClipping::makeClockwise)

    class_<SkeletonData>("SkeletonData")
        .constructor<>()
        .function("getProp_name", optional_override([](SkeletonData &obj) { return convertSPString2std(obj.getName());}))
        .function("getProp_bones", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_slots", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getSlots());}), allow_raw_pointers())
        .function("getProp_skins", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getSkins());}), allow_raw_pointers())
        .function("getProp_defaultSkin", &SkeletonData::getDefaultSkin, allow_raw_pointer<Skin>())
        .function("getProp_events", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getEvents());}), allow_raw_pointers())
        .function("getProp_animations", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getAnimations());}), allow_raw_pointers())
        .function("getProp_ikConstraints", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getIkConstraints());}), allow_raw_pointers())
        .function("getProp_transformConstraints", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getTransformConstraints());}), allow_raw_pointers())
        .function("getProp_pathConstraints", optional_override([](SkeletonData &obj) { return convertSPVector2Std(obj.getPathConstraints());}), allow_raw_pointers())
        .function("getProp_x", &SkeletonData::getX)
        .function("getProp_y", &SkeletonData::getY)
        .function("getProp_width", &SkeletonData::getWidth)
        .function("getProp_height", &SkeletonData::getHeight)
        .function("getProp_version", optional_override([](SkeletonData &obj) { return convertSPString2std(obj.getVersion());}))
        .function("getProp_hash", optional_override([](SkeletonData &obj) { return convertSPString2std(obj.getHash());}))
        .function("getProp_fps", &SkeletonData::getFps)
        .function("getProp_imagesPath", optional_override([](SkeletonData &obj) { return convertSPString2std(obj.getImagesPath());}))
        .function("getProp_audioPath",optional_override([](SkeletonData &obj) { return convertSPString2std(obj.getAudioPath());}))
        .function("findBone", &SkeletonData::findBone, allow_raw_pointer<BoneData>())
        .function("findBoneIndex", &SkeletonData::findBoneIndex)
        .function("findSlot", &SkeletonData::findSlot, allow_raw_pointer<SlotData>())
        .function("findSlotIndex", &SkeletonData::findSlotIndex)
        .function("findSkin", &SkeletonData::findSkin, allow_raw_pointer<Skin>())
        .function("findEvent", &SkeletonData::findEvent, allow_raw_pointer<EventData>())
        //.function("findAnimation", optional_override([](SkeletonData &obj, std::string& name) { return obj.findAnimation(convertStd2SPString(name));}, allow_raw_pointers()))
        .function("findAnimation", &SkeletonData::findAnimation, allow_raw_pointer<Animation>())
        .function("findIkConstraint", &SkeletonData::findIkConstraint, allow_raw_pointer<IkConstraintData>())
        .function("findTransformConstraint", &SkeletonData::findTransformConstraint, allow_raw_pointer<TransformConstraintData>())
        .function("findPathConstraint", &SkeletonData::findPathConstraint, allow_raw_pointer<PathConstraintData>())
        .function("findPathConstraintIndex", &SkeletonData::findPathConstraintIndex);


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

    class_<ShearTimeline, base<TranslateTimeline>>("ShearTimeline")
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
        .function("getProp_frames", optional_override([](RotateTimeline &obj) { return convertSPVector2Std(obj.getFrames());}))
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
        .function("getProp_frames", optional_override([](ColorTimeline &obj) { return convertSPVector2Std(obj.getFrames());}))
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
        .function("getProp_frames", optional_override([](AttachmentTimeline &obj) { return convertSPVector2Std((Vector<float> &)obj.getFrames());}))
        //.function("getProp_attachmentNames", &AttachmentTimeline::getAttachmentNames)
        .function("getPropertyId", &AttachmentTimeline::getPropertyId)
        .function("getFrameCount", &AttachmentTimeline::getFrameCount)
        .function("setFrame", &AttachmentTimeline::setFrame)
        .function("apply", &AttachmentTimeline::apply, allow_raw_pointers());
        //.function("setAttachment", &AttachmentTimeline::setAttachment) //have no setAttachment

    class_<DeformTimeline>("DeformTimeline")
        .constructor<int>()
        .function("getProp_slotIndex", &DeformTimeline::getSlotIndex)
        .function("getProp_attachment", &DeformTimeline::getAttachment, allow_raw_pointer<VertexAttachment>())
        .function("getProp_frames", optional_override([](DeformTimeline &obj) { return convertSPVector2Std((Vector<float> &)obj.getFrames());}))
        .function("getProp_frameVertices", &DeformTimeline::getVertices)
        .function("getPropertyId", &DeformTimeline::getPropertyId)
        .function("setFrame", &DeformTimeline::setFrame)
        .function("apply", &DeformTimeline::apply, allow_raw_pointers());

    class_<EventTimeline>("EventTimeline")
        .constructor<int>()
        .function("getProp_frames", optional_override([](EventTimeline &obj) { return convertSPVector2Std_2(obj.getFrames());}))
        .function("getProp_events", optional_override([](EventTimeline &obj) { return convertSPVector2Std(obj.getEvents());}), allow_raw_pointers())
        .function("getPropertyId", &EventTimeline::getPropertyId)
        .function("getFrameCount", &EventTimeline::getFrameCount)
        .function("setFrame", &EventTimeline::setFrame, allow_raw_pointers())
        .function("apply", &EventTimeline::apply, allow_raw_pointers());

    class_<DrawOrderTimeline>("DrawOrderTimeline")
        .constructor<int>()
        .function("getProp_frames", optional_override([](DrawOrderTimeline &obj) { return convertSPVector2Std(obj.getFrames());}))
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
        .function("getProp_tracks", optional_override([](AnimationState &obj) { return convertSPVector2Std(obj.getTracks());}), allow_raw_pointers())
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
        .function("getProp_name", optional_override([](Animation &obj) { return convertSPString2std(obj.getName());}))
        .function("getProp_timelines", optional_override([](Animation &obj) { return convertSPVector2Std(obj.getTimelines());}))
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
    

    class_<Skeleton>("Skeleton")
        .constructor<SkeletonData *>()
        .function("getProp_data", &Skeleton::getData, allow_raw_pointer<SkeletonData>())
        .function("getProp_bones", optional_override([](Skeleton &obj) { return convertSPVector2Std(obj.getBones());}), allow_raw_pointers())
        .function("getProp_slots", optional_override([](Skeleton &obj) { return convertSPVector2Std(obj.getSlots());}), allow_raw_pointers())
        .function("getProp_drawOrder", optional_override([](Skeleton &obj) { return convertSPVector2Std(obj.getDrawOrder());}), allow_raw_pointers())
        .function("getProp_ikConstraints", optional_override([](Skeleton &obj) { return convertSPVector2Std(obj.getIkConstraints());}), allow_raw_pointers())
        .function("getProp_transformConstraints", optional_override([](Skeleton &obj) { return convertSPVector2Std(obj.getTransformConstraints());}), allow_raw_pointers())
        .function("getProp_pathConstraints", optional_override([](Skeleton &obj) { return convertSPVector2Std(obj.getPathConstraints());}), allow_raw_pointers())
        .function("getProp__updateCache", &Skeleton::getUpdateCacheList, allow_raw_pointer<Updatable>())
        //.function("getProp_updateCacheReset", Skeleton::)
        .function("getProp_skin", &Skeleton::getSkin, allow_raw_pointer<Skin>())
        .function("getProp_color", &Skeleton::getColor)
        .function("getProp_time", &Skeleton::getTime)
        .function("getProp_scaleX", &Skeleton::getScaleX)
        .function("getProp_scaleY", &Skeleton::getScaleY)
        .function("getProp_x", &Skeleton::getX)
        .function("getProp_y", &Skeleton::getY)
        .function("updateCache", &Skeleton::updateCache)
        //.function("sortIkConstraint")
        //.function("sortPathConstraint")
        //.function("sortTransformConstraint")
        //.function("sortPathConstraintAttachment")
        //.function("sortPathConstraintAttachmentWith")
        // .function("sortBone", &Skeleton::sortBone, allow_raw_pointer<Bone>())
        // .function("sortReset", &Skeleton::sortReset, allow_raw_pointer<Bone>())
        .function("updateWorldTransform", &Skeleton::updateWorldTransform)
        .function("setToSetupPose", &Skeleton::setToSetupPose)
        .function("setBonesToSetupPose", &Skeleton::setBonesToSetupPose)
        .function("setSlotsToSetupPose", &Skeleton::setSlotsToSetupPose)
        .function("getRootBone", &Skeleton::getRootBone, allow_raw_pointer<Bone>())
        .function("findBone", &Skeleton::findBone, allow_raw_pointer<Bone>())
        .function("findBoneIndex", &Skeleton::findBoneIndex)
        .function("findSlot", &Skeleton::findSlot, allow_raw_pointer<Slot>())
        .function("findSlotIndex", &Skeleton::findSlotIndex)
        .function("setSkinByName", static_cast<void(Skeleton::*)(const String &)>(&Skeleton::setSkin))
        .function("setSkin", static_cast<void(Skeleton::*)(Skin *)>(&Skeleton::setSkin), allow_raw_pointer<Skin>())
        //.function("getAttachmentByName", static_cast<Attachment *(Skeleton::*)(const String &, const String &)>(&Skeleton::getAttachment), allow_raw_pointer<Attachment>())
        //.function("getAttachment", static_cast<Attachment *(Skeleton::*)(int, const String &)>(&Skeleton::getAttachment))
        .function("setAttachment", &Skeleton::setAttachment)
        .function("findIkConstraint", &Skeleton::findIkConstraint, allow_raw_pointer<IkConstraint>())
        .function("findTransformConstraint", &Skeleton::findTransformConstraint, allow_raw_pointer<TransformConstraint>())
        .function("findPathConstraint", &Skeleton::findPathConstraint, allow_raw_pointer<PathConstraint>())
        //.function("getBounds", &Skeleton::getBounds)
        .function("update", &Skeleton::update);

    // incomplete
    // class_<SkeletonBinary>("SkeletonBinary")
    //     .constructor<AttachmentLoader*>()
    //     .function("setProp_scale", &SkeletonBinary::setScale);
        //.function("getProp_scale", &SkeletonBinary::getScale)
        //.function("readSkeletonData", &SkeletonBinary::readSkeletonData)
        //.function("setCurve", &SkeletonBinary::setCurve);
    // incomplete

    // class_<SkeletonJson>("SkeletonJson")
    //     .constructor<Atlas*>()
    //     .constructor<AttachmentLoader*>();
        //.function("readSkeletonData", &SkeletonJson::readSkeletonData)
        //.function("getProp_scale", &SkeletonJson::getScale)



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
        .function("initSkeleton", &SpineSkeletonInstance::initSkeleton, allow_raw_pointers())
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
        .function("setStartListener", &SpineSkeletonInstance::setStartListener);
}

EMSCRIPTEN_BINDINGS(cocos_spine) {
    class_<SpineWasmUtil>("SpineWasmUtil")
    .class_function("spineWasmInit", &SpineWasmUtil::spineWasmInit)
    .class_function("spineWasmDestroy", &SpineWasmUtil::spineWasmDestroy)
    .class_function("querySpineSkeletonDataByUUID", &SpineWasmUtil::querySpineSkeletonDataByUUID, allow_raw_pointers())
    .class_function("createSpineSkeletonDataWithJson", &SpineWasmUtil::createSpineSkeletonDataWithJson, allow_raw_pointers())
    .class_function("registerSpineSkeletonDataWithUUID", &SpineWasmUtil::registerSpineSkeletonDataWithUUID, allow_raw_pointers())
    .class_function("destroySpineSkeletonDataWithUUID", &SpineWasmUtil::destroySpineSkeletonDataWithUUID)
    .class_function("destroySpineInstance", &SpineWasmUtil::destroySpineInstance, allow_raw_pointers())
    .class_function("getCurrentInstance", &SpineWasmUtil::getCurrentInstance, allow_raw_pointers())
    .class_function("getCurrentEventType", &SpineWasmUtil::getCurrentEventType)
    .class_function("getCurrentTrackEntry", &SpineWasmUtil::getCurrentTrackEntry, allow_raw_pointers())
    .class_function("getCurrentEvent", &SpineWasmUtil::getCurrentEvent, allow_raw_pointers());
}
