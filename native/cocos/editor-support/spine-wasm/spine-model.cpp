#include "spine-model.h"

SpineModel::SpineModel() {

}

SpineModel::~SpineModel() {

}

void SpineModel::addSlotMesh(SlotMesh &mesh, bool needMerge) {
    bool canMerge = false;
    auto count = meshArray.size();
    if (needMerge && count >= 1) {    
        canMerge = true;
    }
    if (canMerge) {
        auto *lastMesh = &meshArray[count - 1];
        lastMesh->vCount += mesh.vCount;
        lastMesh->iCount += mesh.iCount;
    } else {
        meshArray.push_back(mesh);
    }
    uint16_t* iiPtr = mesh.iBuf;
    for (int i = 0; i < mesh.iCount; i++) {
        iiPtr[i] += vCount;
    }
    vCount += mesh.vCount;
    iCount += mesh.iCount;
}

void SpineModel::clearMeshes() {
    meshArray.clear();
    vCount = 0;
    iCount = 0;
}

std::vector<SlotMesh>& SpineModel::getMeshes() {
    return meshArray;
}

void SpineModel::setBufferPtr(uint8_t* vp, uint16_t* ip) {
    vPtr = (uint32_t)vp;
    iPtr = (uint32_t)ip;
}
