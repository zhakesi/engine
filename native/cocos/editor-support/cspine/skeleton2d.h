#pragma once
#include "base/Macros.h"
#include "base/Ptr.h"
#include "base/TypeDef.h"
#include "base/std/container/string.h"
#include "cocos/editor-support/spine/spine.h"

namespace cc {
namespace cspine {
class Skeleton2D final {
public:
    void initSkeletonData(ccstd::string &jsonStr, ccstd::string &atlasText);
    void setSkin(ccstd::string &name);
    void setAnimation (ccstd::string &name);
    void updateAnimation(float dltTime);

private:
    spine::SkeletonData *_skelData = nullptr;
    spine::Skeleton *_skeleton = nullptr;
    spine::AnimationStateData *_animStateData = nullptr;
    spine::AnimationState *_animState = nullptr;
    spine::SkeletonClipping *_clipper = nullptr;
};
}
} // namespace cc
