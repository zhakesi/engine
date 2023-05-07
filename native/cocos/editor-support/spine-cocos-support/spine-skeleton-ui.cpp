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
    auto meshes = _skeletonInstance->updateRenderData();
    _renderer->updateMeshData(meshes);
}

} // namespace cocosSpine
} // namespace cc
