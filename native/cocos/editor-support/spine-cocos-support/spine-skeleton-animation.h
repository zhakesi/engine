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
namespace cocosspine {

class Skeleton2D {
public:
    Skeleton2D();
    ~Skeleton2D();
    void initSkeletonData(ccstd::string &jsonStr, ccstd::string &atlasText);
    void initSkeletonDataBinary(ccstd::string &datPath, ccstd::string &atlasText);
    void setSkin(ccstd::string &name);
    void setAnimation (ccstd::string &name);
    void updateAnimation(float dltTime);
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
}; // class Skeleton2D

} // namespace cocosspine
} // namespace cc
