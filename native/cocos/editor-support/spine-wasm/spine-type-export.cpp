#include <spine/spine.h>
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
 
    class_<Vector2>("Vector2")
        .constructor<float, float>()
        .function("set", static_cast<Vector2&(Vector2::*)(float, float)>(&Vector2::set))
        .function("length", &Vector2::length)
        .function("normalize", static_cast<Vector2&(Vector2::*)()>(&Vector2::normalize))
        .property("x", &Vector2::x)
        .property("y", &Vector2::y);

    class_<JitterVertexEffect>("JitterEffect")
        .constructor<float, float>()
        .function("jitterX", select_overload<float()>(&JitterVertexEffect::getJitterX))
        .function("jitterX", select_overload<void(float)>(&JitterVertexEffect::setJitterX))
        .function("jitterY", select_overload<float()>(&JitterVertexEffect::getJitterY))
        .function("jitterY", select_overload<void(float)>(&JitterVertexEffect::setJitterY))
        .function("end", &JitterVertexEffect::end);

    class_<SwirlVertexEffect>("SwirlEffect")
        .function("centerX", select_overload<float()>(&SwirlVertexEffect::getCenterX))
        .function("centerX", select_overload<void(float)>(&SwirlVertexEffect::setCenterX))
        .function("centerY", select_overload<float()>(&SwirlVertexEffect::getCenterY))
        .function("centerY", select_overload<void(float)>(&SwirlVertexEffect::setCenterY))
        .function("radius", select_overload<float()>(&SwirlVertexEffect::getRadius))
        .function("radius", select_overload<void(float)>(&SwirlVertexEffect::setRadius))
        .function("angle", select_overload<float()>(&SwirlVertexEffect::getAngle))
        .function("angle", select_overload<void(float)>(&SwirlVertexEffect::setAngle))
        .function("end", &SwirlVertexEffect::end);


}