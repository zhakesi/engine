#ifndef __SK_MESH_DATA_H__
#define __SK_MESH_DATA_H__
#include <stdint.h>

class SkMeshData {

public:
    SkMeshData();
    SkMeshData(uint32_t vc, uint32_t ic, uint32_t byteStride);
    SkMeshData(uint32_t slot, uint8_t* vBuf, uint16_t* iBuf,
        uint32_t vc, uint32_t ic, uint32_t byteStride, uint32_t blend);
    ~SkMeshData();
    uint32_t FreeData();
    
public:
    uint8_t  *vb;
    uint16_t *ib;
    uint32_t vbCount;
    uint32_t ibCount;
    uint32_t stride;
    uint32_t slotIndex;
    uint32_t blendMode;
};

#endif