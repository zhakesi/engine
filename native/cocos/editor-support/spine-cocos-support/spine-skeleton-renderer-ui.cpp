#include "spine-skeleton-renderer-ui.h"
#include "2d/renderer/RenderDrawInfo.h"
#include "2d/renderer/RenderEntity.h"
#include "2d/renderer/UIMeshBuffer.h"
#include "2d/renderer/Batcher2d.h"
#include "core/Root.h"
#include "renderer/core/MaterialInstance.h"

using namespace cc::gfx;
namespace cc {
namespace cocosSpine {

static const std::vector<gfx::Attribute> ATTRIBUTES_V3F_T2F_C4B{
    gfx::Attribute{gfx::ATTR_NAME_POSITION, gfx::Format::RGB32F},
    gfx::Attribute{gfx::ATTR_NAME_TEX_COORD, gfx::Format::RG32F},
    gfx::Attribute{gfx::ATTR_NAME_COLOR, gfx::Format::RGBA8, true},
};

SpineSkeletonRendererUI::SpineSkeletonRendererUI() {

}

SpineSkeletonRendererUI::~SpineSkeletonRendererUI() {

}

void SpineSkeletonRendererUI::onDestroy() {
    if (_uiMesh) {
        auto *batch2d = cc::Root::getInstance()->getBatcher2D();
        uint16_t accID = 65534;
        batch2d->removeMeshBuffer(accID, _uiMesh);
    }
    destroyMaterialCaches();
}

void SpineSkeletonRendererUI::destroyMaterialCaches() {
    for (auto& kv : _materialCaches) {
        cc::Material* material = kv.second;
        if (material) {
            material->destroy();
            kv.second = nullptr;
        }
    }
    _materialCaches.clear();
}

void SpineSkeletonRendererUI::setRenderEntity(cc::RenderEntity *entity) {
    _entity = entity;
}

void SpineSkeletonRendererUI::updateMeshData(SpineSkeletonMeshData* mesh, std::vector<SpineMeshBlendInfo> &blendArray) {
    if (!_uiMesh) {
        _uiMesh = new UIMeshBuffer();
        ccstd::vector<gfx::Attribute> attrs = ATTRIBUTES_V3F_T2F_C4B;
        _uiMesh->initialize(std::move(attrs), true);
        auto *batch2d = cc::Root::getInstance()->getBatcher2D();
        uint16_t accID = 65534;
        batch2d->addMeshBuffer(accID, _uiMesh);
    }

    _uiMesh->setVData((float*)mesh->vBuf);
    _uiMesh->setIData(mesh->iBuf);
    uint32_t byteOffset = mesh->vCount * mesh->byteStride;
    _uiMesh->setByteOffset(byteOffset);

    _entity->clearDynamicRenderDrawInfos();
    auto drawSize = blendArray.size();
    for (int i = 0; i < drawSize; i++) {
        auto blend = blendArray[i].blendMode;
        auto iOffset = blendArray[i].indexOffset;
        auto iCount = blendArray[i].indexCount;
        auto *curDrawInfo = requestDrawInfo(i);
        auto material = requestMaterial(blend);
        curDrawInfo->setMaterial(material);
        gfx::Texture *texture = _texture->getGFXTexture();
        gfx::Sampler *sampler = _texture->getGFXSampler();
        curDrawInfo->setTexture(texture);
        curDrawInfo->setSampler(sampler);

        curDrawInfo->setMeshBuffer(_uiMesh);
        curDrawInfo->setIndexOffset(iOffset);
        curDrawInfo->setIbCount(iCount);

        _entity->addDynamicRenderDrawInfo(curDrawInfo);
    }
}

cc::RenderDrawInfo *SpineSkeletonRendererUI::requestDrawInfo(int idx) {
    if (_drawInfoArray.size() < idx + 1) {
        cc::RenderDrawInfo *draw = new cc::RenderDrawInfo();
        draw->setDrawInfoType(static_cast<uint32_t>(RenderDrawInfoType::MIDDLEWARE));
        _drawInfoArray.push_back(draw);
    }
    return _drawInfoArray[idx];
}

cc::Material *SpineSkeletonRendererUI::requestMaterial(uint32_t blendMode) {
    bool _premultipliedAlpha = true;
    uint16_t blendSrc, blendDst;
    switch (blendMode) {
        case spine::BlendMode::BlendMode_Additive:
            blendSrc = static_cast<uint16_t>(_premultipliedAlpha ? BlendFactor::ONE : BlendFactor::SRC_ALPHA);
            blendDst = static_cast<uint16_t>(BlendFactor::ONE);
            break;
        case spine::BlendMode::BlendMode_Multiply:
            blendSrc = static_cast<uint16_t>(BlendFactor::DST_COLOR);
            blendDst = static_cast<uint16_t>(BlendFactor::ONE_MINUS_SRC_ALPHA);
            break;
        case spine::BlendMode::BlendMode_Screen:
            blendSrc = static_cast<uint16_t>(BlendFactor::ONE);
            blendDst = static_cast<uint16_t>(BlendFactor::ONE_MINUS_SRC_COLOR);
            break;
        default:
            blendSrc = static_cast<uint16_t>(_premultipliedAlpha ? BlendFactor::ONE : BlendFactor::SRC_ALPHA);
            blendDst = static_cast<uint16_t>(BlendFactor::ONE_MINUS_SRC_ALPHA);
    }
    return requestMaterial(blendSrc, blendDst);
}

cc::Material *SpineSkeletonRendererUI::requestMaterial(uint16_t blendSrc, uint16_t blendDst) {
    uint32_t key = static_cast<uint32_t>(blendSrc) << 16 | static_cast<uint32_t>(blendDst);
    if (_materialCaches.find(key) == _materialCaches.end()) {
        const IMaterialInstanceInfo info{ (Material *)_material, 0};
        MaterialInstance *materialInstance = new MaterialInstance(info);
        PassOverrides overrides;
        BlendStateInfo stateInfo;
        stateInfo.blendColor = gfx::Color{1.0F, 1.0F, 1.0F, 1.0F};
        BlendTargetInfo targetInfo;
        targetInfo.blendEq = gfx::BlendOp::ADD;
        targetInfo.blendAlphaEq = gfx::BlendOp::ADD;
        targetInfo.blendSrc = (gfx::BlendFactor)blendSrc;
        targetInfo.blendDst = (gfx::BlendFactor)blendDst;
        targetInfo.blendSrcAlpha = (gfx::BlendFactor)blendSrc;
        targetInfo.blendDstAlpha = (gfx::BlendFactor)blendDst;
        BlendTargetInfoList targetList{targetInfo};
        stateInfo.targets = targetList;
        overrides.blendState = stateInfo;
        materialInstance->overridePipelineStates(overrides);
        const MacroRecord macros{{"TWO_COLORED", false}, {"USE_LOCAL", true}};
        materialInstance->recompileShaders(macros);
        _materialCaches[key] = materialInstance;
    }
    return _materialCaches[key];
}

} // namespace cocosSpine
} // namespace cc
