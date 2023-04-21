#ifndef __SK_MESH_DATA_H__
#define __SK_MESH_DATA_H__
#include <stdint.h>

class SkMeshData {
struct UserData {
    uint32_t slotIndex;
};
public:
    SkMeshData();
    SkMeshData(uint32_t vc, uint32_t ic, uint32_t byteStride);
    ~SkMeshData();
    
public:
    uint8_t  *vb;
    uint16_t *ib;
    uint32_t vbCount;
    uint32_t ibCount;
    uint32_t stride;
    UserData userData;
};

#endif