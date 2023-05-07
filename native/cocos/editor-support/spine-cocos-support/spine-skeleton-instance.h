#pragma once
#include "base/Macros.h"
#include "base/Ptr.h"
#include "base/TypeDef.h"
#include <vector>
#include "bindings/utils/BindingUtils.h"
#include "base/std/container/string.h"
#include "cocos/editor-support/spine/spine.h"
#include "spine-mesh-data.h"

namespace cc {
namespace cocosSpine {

class SpineSkeletonInstance {
public:
    SpineSkeletonInstance();
    ~SpineSkeletonInstance();
    void initSkeletonData(ccstd::string &jsonStr, ccstd::string &atlasText);
    void initSkeletonDataBinary(ccstd::string &datPath, ccstd::string &atlasText);
    void setSkin(ccstd::string &name);
    bool setAnimation(uint32_t trackIndex, ccstd::string &name, bool loop);
    void updateAnimation(float dltTime);
    void setTimeScale(float scale);
    std::vector<Skeleton2DMesh *>& updateRenderData();

private:
    void realTimeTraverse();
    void processVertices();

private:
    std::vector<Skeleton2DMesh *> _meshes{};
    spine::SkeletonData *_skelData = nullptr;
    spine::Skeleton *_skeleton = nullptr;
    spine::AnimationStateData *_animStateData = nullptr;
    spine::AnimationState *_animState = nullptr;
    spine::SkeletonClipping *_clipper = nullptr;
}; // class 

} // namespace cocosSpine
} // namespace cc
