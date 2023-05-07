#include "spine-mesh-data.h"
#include "core/platform/Debug.h"
#include "base/memory/Memory.h"

namespace cc {
namespace cocosSpine {

SpineSkeletonMeshData::SpineSkeletonMeshData() {
    vBuf = nullptr;
    iBuf = nullptr;
    vCount = 0;
    iCount = 0;
    byteStride = 0;
    slotIndex = 0;
    blendMode = 0;
}

SpineSkeletonMeshData::SpineSkeletonMeshData(uint32_t vc, uint32_t ic, uint32_t bStride) {
    vCount = vc;
    iCount = ic;
    byteStride = bStride;
    vBuf = new uint8_t[vc * byteStride];;
    iBuf = new uint16_t[ic];
    slotIndex = 0;
    blendMode = 0;
}

SpineSkeletonMeshData::SpineSkeletonMeshData(uint32_t slot, uint8_t* vb, uint16_t* ib,
    uint32_t vc, uint32_t ic, uint32_t stride, uint32_t blend) {
    slotIndex = slot;
    vBuf = vb;
    iBuf = ib;
    vCount = vc;
    iCount = ic;
    byteStride = stride;
    blendMode = blend;
}

SpineSkeletonMeshData::~SpineSkeletonMeshData() {

}

void SpineSkeletonMeshData::Release() {
    if (vBuf) {
        delete[] vBuf;
        vBuf = nullptr;
    }
    if (iBuf) {
        delete[] iBuf;
        iBuf = nullptr;
    }
}

}
}
