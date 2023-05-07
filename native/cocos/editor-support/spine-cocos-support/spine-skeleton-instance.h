#pragma once
#include "base/Macros.h"
#include "base/Ptr.h"
#include "base/TypeDef.h"
#include <vector>
#include "bindings/utils/BindingUtils.h"
#include "base/std/container/string.h"
#include "cocos/editor-support/spine/spine.h"
#include "spine-mesh-data.h"
#include "middleware-adapter.h"

namespace cc {
namespace cocosSpine {

class SpineSkeletonInstance {
struct UserData {
    bool doScale = false;
    bool doFillZ = true;
    float scale = 1.0F;
    bool premultipliedAlpha = true;
    middleware::Color4F color = middleware::Color4F(1.0F, 1.0F, 1.0F, 1.0F);
};

public:
    SpineSkeletonInstance();
    ~SpineSkeletonInstance();
    void     initSkeletonData(ccstd::string &jsonStr, ccstd::string &atlasText);
    void     initSkeletonDataBinary(ccstd::string &datPath, ccstd::string &atlasText);
    void     setSkin(ccstd::string &name);
    bool     setAnimation(uint32_t trackIndex, ccstd::string &name, bool loop);
    void     updateAnimation(float dltTime);
    void     setTimeScale(float scale);
    SpineSkeletonMeshData* updateRenderData(std::vector<SpineMeshBlendInfo> &blendInfos);

private:
    void     collectMeshData(std::vector<SpineSkeletonMeshData> &meshArray);
    void     processVertices(std::vector<SpineSkeletonMeshData> &meshes);
    void     mergeMeshes(std::vector<SpineSkeletonMeshData> &meshArray, std::vector<SpineMeshBlendInfo> &blendInfos);
    void     releaseMeshData();

private:
    SpineSkeletonMeshData* _mesh = nullptr;
    spine::SkeletonData *_skelData = nullptr;
    spine::Skeleton *_skeleton = nullptr;
    spine::AnimationStateData *_animStateData = nullptr;
    spine::AnimationState *_animState = nullptr;
    spine::SkeletonClipping *_clipper = nullptr;
    spine::VertexEffect *_effect = nullptr;
    UserData _userData;
}; // class 

} // namespace cocosSpine
} // namespace cc
