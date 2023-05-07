#include "spine-skeleton-renderer-ui.h"
#include "2d/renderer/RenderDrawInfo.h"
#include "2d/renderer/RenderEntity.h"
#include "2d/renderer/UIMeshBuffer.h"
#include "2d/renderer/Batcher2d.h"
#include "core/Root.h"

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

void SpineSkeletonRendererUI::setRenderEntity(cc::RenderEntity *entity) {
    _entity = entity;
}

void SpineSkeletonRendererUI::updateMeshData(std::vector<Skeleton2DMesh *> &meshes) {
    if (!_uiMesh) {
        _uiMesh = new UIMeshBuffer();
        ccstd::vector<gfx::Attribute> attrs = ATTRIBUTES_V3F_T2F_C4B;
        _uiMesh->initialize(std::move(attrs), true);
    }

    int count = meshes.size();
    int vCount = 0;
    int iCount = 0;
    for (int i = 0; i < count; i++) {
        vCount += meshes[i]->vCount;
        iCount += meshes[i]->iCount;
    }
    _vData.resize(6 * vCount);
    _iData.resize(iCount);

    uint16_t* iPtr = _iData.data();
    float *vPtr = _vData.data();

    vCount = 0;
    iCount = 0;
    for (int i = 0; i < count; i++) {
        int iCount = meshes[i]->iCount;
        uint16_t *indices = meshes[i]->indices.data();
        for (int ii = 0; ii < iCount; ii++) {
            iPtr[iCount + ii] = indices[ii] + vCount;
        }
        vCount += meshes[i]->vCount;
        int byteSize = meshes[i]->byteStride * meshes[i]->vCount;
        memcpy(vPtr, meshes[i]->vertices.data(), byteSize);
        vPtr += meshes[i]->vCount * 6;
    }

    _uiMesh->setVData(_vData.data());
    _uiMesh->setByteOffset(24 * _vData.size());
    _uiMesh->setIData(_iData.data());

    uint16_t accID = 65534;
    ccstd::vector<UIMeshBuffer *> uiMeshArray;
    uiMeshArray.push_back(_uiMesh);
    auto *batch2d = cc::Root::getInstance()->getBatcher2D();
    batch2d->syncMeshBuffersToNative(accID, std::move(uiMeshArray));

    _entity->clearDynamicRenderDrawInfos();
    auto *curDrawInfo = requestDrawInfo(0);

    curDrawInfo->setMaterial(_material);
    gfx::Texture *texture = _texture->getGFXTexture();
    gfx::Sampler *sampler = _texture->getGFXSampler();
    curDrawInfo->setTexture(texture);
    curDrawInfo->setSampler(sampler);

    curDrawInfo->setMeshBuffer(_uiMesh);
    curDrawInfo->setIndexOffset(0);
    curDrawInfo->setIbCount(_iData.size());

    _entity->addDynamicRenderDrawInfo(curDrawInfo);
}

cc::RenderDrawInfo *SpineSkeletonRendererUI::requestDrawInfo(int idx) {
    if (_drawInfoArray.size() < idx + 1) {
        cc::RenderDrawInfo *draw = new cc::RenderDrawInfo();
        draw->setDrawInfoType(static_cast<uint32_t>(RenderDrawInfoType::MIDDLEWARE));
        _drawInfoArray.push_back(draw);
    }
    return _drawInfoArray[idx];
}

} // namespace cocosSpine
} // namespace cc
