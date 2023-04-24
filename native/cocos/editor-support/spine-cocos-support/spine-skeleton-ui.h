#pragma once
#include <vector>
#include "base/Macros.h"
#include "base/Ptr.h"
#include "base/TypeDef.h"
#include "Object.h"
#include "bindings/utils/BindingUtils.h"
#include "base/std/container/string.h"
#include "cocos/editor-support/spine/spine.h"
#include "spine-mesh-data.h"
#include "spine-skeleton-animation.h"
#include "spine-partial-renderer-ui.h"

namespace cc {
namespace cocosspine {

class SpineSkeletonUI {
public:
    SpineSkeletonUI();
    ~SpineSkeletonUI();
    void setSkeletonInstance(cc::cocosspine::Skeleton2D* obj);
    void updateRenderData();
    void setPartialRenderer(cc::cocosspine::SpinePartialRendererUI* rendererUI);

private:
    cc::cocosspine::Skeleton2D* skeletonInstance = nullptr;
    cc::cocosspine::SpinePartialRendererUI* renderer = nullptr;
}; // class SpineSkeletonUI

} // namespace cocosspine
} // namespace cc
