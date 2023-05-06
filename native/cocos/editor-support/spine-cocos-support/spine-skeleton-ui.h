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
#include "spine-skeleton-instance.h"
#include "spine-partial-renderer-ui.h"

namespace cc {
namespace cocosSpine {

class SpineSkeletonUI {
public:
    SpineSkeletonUI();
    ~SpineSkeletonUI();
    //void setSkeletonInstance(cc::cocosSpine::Skeleton2D* obj);
    void updateRenderData();
    //void setPartialRenderer(cc::cocosSpine::SpinePartialRendererUI* rendererUI);

private:
    //cc::cocosSpine::Skeleton2D* skeletonInstance = nullptr;
    //cc::cocosSpine::SpinePartialRendererUI* renderer = nullptr;
}; // class SpineSkeletonUI

} // namespace cocosSpine
} // namespace cc
