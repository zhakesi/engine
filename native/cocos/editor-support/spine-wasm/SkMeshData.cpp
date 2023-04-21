#include "SkMeshData.h"

SkMeshData::SkMeshData()
{

}

SkMeshData::SkMeshData(uint32_t vc, uint32_t ic, uint32_t byteStride)
{
    vbCount = vc;
    ibCount = ic;
    stride = byteStride;
    vb = new uint8_t[vc * byteStride];
    ib = new uint16_t[ic];
}

SkMeshData::~SkMeshData() {
    if (vb) {
        delete[] vb;
        vb = nullptr;
    }
    if (ib) {
        delete[] ib;
        ib = nullptr;
    }
}