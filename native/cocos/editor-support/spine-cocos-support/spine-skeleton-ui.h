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
#include "spine-skeleton-renderer-ui.h"

namespace cc {
namespace cocosSpine {

class SpineSkeletonUI {
public:
    SpineSkeletonUI();
    ~SpineSkeletonUI();
    void setSkeletonInstance(cc::cocosSpine::SpineSkeletonInstance* obj);
    void setSkeletonRendererer(cc::cocosSpine::SpineSkeletonRendererUI* rendererUI);
    void updateRenderData();

private:
    cc::cocosSpine::SpineSkeletonInstance* _skeletonInstance = nullptr;
    cc::cocosSpine::SpineSkeletonRendererUI* _renderer = nullptr;
}; // class SpineSkeletonUI

} // namespace cocosSpine
} // namespace cc
