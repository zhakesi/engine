#include "SkMeshData.h"

SkMeshData::SkMeshData()
{
    vb = nullptr;
    ib = nullptr;
    vbCount = 0;
    ibCount = 0;
    stride = 0;
    slotIndex = 0;
    blendMode = 0;
}

SkMeshData::SkMeshData(uint32_t vc, uint32_t ic, uint32_t byteStride)
{
    vbCount = vc;
    ibCount = ic;
    stride = byteStride;
    vb = new uint8_t[vc * byteStride];
    ib = new uint16_t[ic];
    slotIndex = 0;
    blendMode = 0;
}

SkMeshData::SkMeshData(uint32_t slot, uint8_t* vBuf, uint16_t* iBuf,
    uint32_t vc, uint32_t ic, uint32_t byteStride, uint32_t blend)
{
    slotIndex = slot;
    vb = vBuf;
    ib = iBuf;
    vbCount = vc;
    ibCount = ic;
    stride = byteStride;
    blendMode = blend;
}

uint32_t SkMeshData::FreeData() {
    if (vb) {
        delete[] vb;
        vb = nullptr;
    }
    if (ib) {
        delete[] ib;
        ib = nullptr;
    }
    return 0;
}

SkMeshData::~SkMeshData() {
}