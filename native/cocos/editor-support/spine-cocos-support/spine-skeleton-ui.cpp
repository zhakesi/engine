#include "spine-skeleton-ui.h"
#include "2d/renderer/RenderDrawInfo.h"
#include "2d/renderer/RenderEntity.h"

namespace cc {
namespace cocosspine {

SpineSkeletonUI::SpineSkeletonUI() {

}

SpineSkeletonUI::~SpineSkeletonUI() {

}

void SpineSkeletonUI::setSkeletonInstance(cc::cocosspine::Skeleton2D* obj) {
    skeletonInstance = obj;
}

void SpineSkeletonUI::updateRenderData() {
    if (!skeletonInstance || !renderer) return;
    auto meshes = skeletonInstance->updateRenderData();
    renderer->updateMeshData(meshes);
}

void SpineSkeletonUI::setPartialRenderer(cc::cocosspine::SpinePartialRendererUI* rendererUI) {
    renderer = rendererUI;
}

} // namespace cocosspine
} // namespace cc
