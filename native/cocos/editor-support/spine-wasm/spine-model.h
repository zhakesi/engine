#ifndef __SPINE_MODEL_H__
#define __SPINE_MODEL_H__
#include <vector>
#include <spine/spine.h>
#include "mesh-type-define.h"

using namespace spine;
class SlotMesh {
public:
    SlotMesh() {}
    SlotMesh(uint8_t* vb, uint16_t* ib, uint32_t vc, uint32_t ic, BlendMode blend)
        :vBuf(vb), iBuf(ib), vCount(vc), iCount(ic), blendMode(blend) {}
    ~SlotMesh() {}
    uint8_t  *vBuf;
    uint16_t *iBuf;
    uint32_t vCount;
    uint32_t iCount;
    BlendMode blendMode;
};

class SpineModel {
public:
    SpineModel();
    ~SpineModel();
    void addSlotMesh(SlotMesh &mesh, bool needMerge = true);
    void clearMeshes();
    void setBufferPtr(uint8_t* vp, uint16_t* ip);
    std::vector<SlotMesh>& getMeshes();
public:
    uint32_t vCount;
    uint32_t iCount;
    uint32_t vPtr;
    uint32_t iPtr;
    std::vector<SlotMesh> meshArray{};
};

#endif