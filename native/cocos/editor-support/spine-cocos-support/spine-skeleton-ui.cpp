#include "spine-skeleton-ui.h"
#include "2d/renderer/RenderDrawInfo.h"
#include "2d/renderer/RenderEntity.h"

namespace cc {
namespace cocosSpine {

SpineSkeletonUI::SpineSkeletonUI() {

}

SpineSkeletonUI::~SpineSkeletonUI() {

}

void SpineSkeletonUI::setSkeletonInstance(cc::cocosSpine::SpineSkeletonInstance* obj) {
    _skeletonInstance = obj;
}

void SpineSkeletonUI::setSkeletonRendererer(cc::cocosSpine::SpineSkeletonRendererUI* rendererUI) {
    _renderer = rendererUI;
}

void SpineSkeletonUI::updateRenderData() {
    if (!_skeletonInstance || !_renderer) return;
    std::vector<SpineMeshBlendInfo> blendArray;
    auto meshe = _skeletonInstance->updateRenderData(blendArray);
    _renderer->updateMeshData(meshe, blendArray);
}

void SpineSkeletonUI::onDestroy() {
    
}

} // namespace cocosSpine
} // namespace cc
