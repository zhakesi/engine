#include <2d/renderer/RenderEntity.h>
#include <cocos/base/TypeDef.h>
#include "RenderEntity.h"
#include <iostream>

namespace cc {
RenderEntity::RenderEntity() : RenderEntity(0, 0, 0) {
}

RenderEntity::RenderEntity(const index_t bufferId, const index_t vertexOffset, const index_t indexOffset) {
    this->_bufferId = bufferId;
    this->_vertexOffset = vertexOffset;
    this->_indexOffset = indexOffset;
}

RenderEntity::~RenderEntity() {
}

void RenderEntity::setBufferId(index_t bufferId) {
    this->_bufferId = bufferId;
}

void RenderEntity::setVertexOffset(index_t vertexOffset) {
    this->_vertexOffset = vertexOffset;
}

void RenderEntity::setIndexOffset(index_t indexOffset) {
    this->_indexOffset = indexOffset;
}

void RenderEntity::setVbBuffer(float_t* vbBuffer) {
    this->_vbBuffer = vbBuffer;
}

void RenderEntity::setVDataBuffer(float_t* vDataBuffer) {
    this->_vDataBuffer = vDataBuffer;
}

void RenderEntity::setIDataBuffer(uint16_t* iDataBuffer) {
    this->_iDataBuffer = iDataBuffer;
}

void RenderEntity::setAdvanceRenderDataArr(std::vector<AdvanceRenderData*>&& arr) {
    this->_dataArr = std::move(arr);
}

void RenderEntity::ItIsDebugFuncInRenderEntity() {
    std::cout << "It is debug func in RenderEntity.";
}
}