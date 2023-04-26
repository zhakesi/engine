#include "SkeletonObject.h"
#include "LogUtil.h"
#include "spine/spine.h"
#include <map>
#include <string>
#include "data-convert.h"
#include "AtlasAttachmentLoaderExtension.h"
#include "share-mem.h"

using namespace spine;
extern void consoleLog(uint32_t start, uint32_t length);

const Color4B WHITE(255, 255, 255, 255);

static std::map<uint32_t, SkeletonHandle> handleTable {};
static uint32_t generateID() {
    static uint32_t id = 0;
    return id++;
}

SkeletonHandle getSkeletonHandle(uint32_t objID) {
    if (handleTable.find(objID) == handleTable.end()) return nullptr;
    return handleTable[objID];
}

SkeletonObject::SkeletonObject() {
    _objID = generateID();
    handleTable[_objID] = this;

    _meshArray.clear();
}

SkeletonObject::~SkeletonObject() {

}

uint32_t SkeletonObject::ObjectID() {
    return _objID;
}

uint32_t SkeletonObject::initWithSkeletonData(bool isJson, uint32_t start, uint32_t length) {

    std::string name = DataConvert::Convert2StdString(start, length);
    std::string altasStr = name + ".atlas";
    String atlasFile(altasStr.c_str());
    auto* atlas = new Atlas(atlasFile, nullptr);
    if (!atlas) {
        LogUtil::PrintToJs("create atlas failed!!!");
        return false;
    }
    //LogUtil::PrintToJs("create atlas ok.");

    AttachmentLoader *attachmentLoader = new AtlasAttachmentLoaderExtension(atlas);
    if (isJson) {
        std::string jsonStr = name + ".json";
        String jsonFile(jsonStr.c_str());
        SkeletonJson* json = new SkeletonJson(attachmentLoader);
        _skeletonData = json->readSkeletonDataFile(jsonFile);
        delete json;
    } else {
        SkeletonBinary* binary = new SkeletonBinary(attachmentLoader);
        std::string binStr = name + ".bin";
        int byteCount = 0;
        String binFile(binStr.c_str());
        _skeletonData = binary->readSkeletonDataFile(binFile);
        delete binary;
    }

    _skeleton = new Skeleton(_skeletonData);

    _animStateData = new AnimationStateData(_skeletonData);

    _animState = new AnimationState(_animStateData);

    _clipper = new SkeletonClipping();

    _skeleton->setToSetupPose();
    _skeleton->updateWorldTransform();

    //LogUtil::PrintToJs("initWithSkeletonData ok.");
    return true;
}

uint32_t SkeletonObject::updateRenderData()
{
    SkMeshData *currMesh;
    std::vector<SkMeshData> meshes;
    meshes.clear();

    unsigned int byteStride = sizeof(V3F_T2F_C4B);
    int startSlotIndex = -1;
    int endSlotIndex = -1;
    bool inRange = true;
    auto &drawOrder = _skeleton->getDrawOrder();
    int drawCount = drawOrder.size();

    if (_effect) {
        _effect->begin(*_skeleton);
    }

    Color4F color;
    for (uint32_t drawIdx = 0, n = drawCount; drawIdx < n; ++drawIdx) {
        color.r = _userData.color.r;
        color.g = _userData.color.g;
        color.b = _userData.color.b;
        color.a = _userData.color.a;
        auto slot = drawOrder[drawIdx];
        if (slot->getBone().isActive() == false) {
            continue;
        }
        if (startSlotIndex >= 0 && startSlotIndex == slot->getData().getIndex()) {
            inRange = true;
        }
        if (!inRange) {
            _clipper->clipEnd(*slot);
            continue;
        }
        if (endSlotIndex >= 0 && endSlotIndex == slot->getData().getIndex()) {
            inRange = false;
        }

        if (!slot->getAttachment()) {
            _clipper->clipEnd(*slot);
            continue;
        }

        if (slot->getAttachment()->getRTTI().isExactly(RegionAttachment::rtti)) {
            auto *attachment = dynamic_cast<RegionAttachment *>(slot->getAttachment());
            auto *attachmentVertices = reinterpret_cast<AttachmentVertices *>(attachment->getRendererObject());

            auto vertCount = attachmentVertices->_triangles->vertCount;
            int stride = sizeof(V3F_T2F_C4B);
            auto vbSize = vertCount * stride;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto ibSize = indexCount * sizeof(uint16_t);
            SkMeshData mesh(drawIdx,
                (uint8_t*)attachmentVertices->_triangles->verts,
                attachmentVertices->_triangles->indices,
                vertCount,
                indexCount,
                byteStride,
                slot->getData().getBlendMode());
            attachment->computeWorldVertices(slot->getBone(),(float *)mesh.vb, 0, stride / sizeof(float));
            meshes.push_back(mesh);
            currMesh = &mesh;
            color.r *= attachment->getColor().r;
            color.g *= attachment->getColor().g;
            color.b *= attachment->getColor().b;
            color.a *= attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(MeshAttachment::rtti)) {
            auto *attachment = dynamic_cast<MeshAttachment *>(slot->getAttachment());
            auto *attachmentVertices = static_cast<AttachmentVertices *>(attachment->getRendererObject());      

            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto vbSize = vertCount * byteStride;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto ibSize = indexCount * sizeof(uint16_t);

            SkMeshData mesh(drawIdx,
                (uint8_t*)attachmentVertices->_triangles->verts,
                attachmentVertices->_triangles->indices,
                vertCount,
                indexCount,
                byteStride,
                slot->getData().getBlendMode());
            attachment->computeWorldVertices(*slot, 0, attachment->getWorldVerticesLength(), (float *)mesh.vb, 0, byteStride / sizeof(float));
            meshes.push_back(mesh);
            currMesh = &mesh;

            color.r *= attachment->getColor().r;
            color.g *= attachment->getColor().g;
            color.b *= attachment->getColor().b;
            color.a *= attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(ClippingAttachment::rtti)) {
            auto *clip = dynamic_cast<ClippingAttachment *>(slot->getAttachment());
            _clipper->clipStart(*slot, clip);
            continue;
        } else {
            _clipper->clipEnd(*slot);
            continue;
        }

        uint32_t uintA = (uint32_t)(255* _skeleton->getColor().a * slot->getColor().a * color.a);
        uint32_t multiplier = _userData.premultipliedAlpha ? uintA : 255;
        uint32_t uintR = (uint32_t)(_skeleton->getColor().r * slot->getColor().r * color.r * multiplier);
        uint32_t uintG = (uint32_t)(_skeleton->getColor().g * slot->getColor().g * color.g * multiplier);
        uint32_t uintB = (uint32_t)(_skeleton->getColor().b * slot->getColor().b * color.b * multiplier);
        uint32_t uintColor = (uintA << 24) + (uintB << 16) + (uintG << 8) + uintR;

        if (_clipper->isClipping()) {

        } else {
            int byteStride = sizeof(V3F_T2F_C4B); 
            int vCount = currMesh->vbCount;
            V3F_T2F_C4B *vertex = (V3F_T2F_C4B *)currMesh->vb;
            uint32_t* uPtr = (uint32_t*)currMesh->vb;
            if (_effect) {
                for (int v = 0; v < vCount; ++v) {
                    _effect->transform(vertex[v].vertex.x, vertex[v].vertex.y);
                    uPtr[v * 6 + 5] = uintColor;
                }
            } else {
                for (int v = 0; v < vCount; ++v) {
                    uPtr[v * 6 + 5] = uintColor;
                }
            }
        }
        _clipper->clipEnd(*slot);
    }
    _clipper->clipEnd();
    if (_effect) _effect->end();

    processVertices(meshes);
    mergeMeshes(meshes);

    return true;
}

void SkeletonObject::processVertices(std::vector<SkMeshData> &meshes)
{
    int byteStride = sizeof(V3F_T2F_C4B); 
    int count = meshes.size();
    if (_userData.doScale && _userData.doFillZ) {
        float scale = _userData.scale;
        float zoffset = 0;
        for (int i = 0; i < count; i++) {
            auto mesh = meshes[i];
            float *ptr = (float *)mesh.vb;
            for (int m = 0; m < mesh.vbCount; m++) {
                float *vert = ptr + m * byteStride / sizeof(float);
                vert[0] *= scale;
                vert[1] *= scale;
                vert[2] = zoffset;
            }
            zoffset += 0.01F;
        }
    } else if (_userData.doScale && !_userData.doFillZ) {
        float scale = _userData.scale;
        float zValue = 0;
        for (int i = 0; i < count; i++) {
            auto mesh = meshes[i];
            float *ptr = (float *)mesh.vb;
            for (int m = 0; m < mesh.vbCount; m++) {
                float *vert = ptr + m * byteStride / sizeof(float);
                vert[0] *= scale;
                vert[1] *= scale;
                vert[2] = zValue;
            }
        }
    } else if (!_userData.doScale && _userData.doFillZ) {
        float zoffset = 0;
        for (int i = 0; i < count; i++) {
            auto mesh = meshes[i];
            float *ptr = (float *)mesh.vb;
            for (int m = 0; m < mesh.vbCount; m++) {
                float *vert = ptr + m * byteStride / sizeof(float);
                vert[2] = zoffset;
            }
            zoffset = 0;
        }
    }
}

void SkeletonObject::mergeMeshes(std::vector<SkMeshData> &meshes) {

    resetMeshArray();
    int count = meshes.size();
    int vCount = 0;
    int iCount = 0;
    for (int i = 0; i < count; i++) {
        vCount += meshes[i].vbCount;
        iCount += meshes[i].ibCount;
    }
    uint32_t byteStide = sizeof(V3F_T2F_C4B); 
    SkMeshData* merge = new SkMeshData(vCount, iCount, byteStide);
    vCount = 0;
    iCount = 0;
    for (int i = 0; i < count; i++) {

        uint16_t* iPtr = merge->ib + iCount;
        for (int ii = 0; ii < meshes[i].ibCount; ii++) {
            iPtr[ii] = meshes[i].ib[ii] + vCount;
        }
        uint8_t* vPtr = merge->vb + vCount * byteStide;
        uint32_t byteSize = meshes[i].vbCount * byteStide;
        memcpy(vPtr, meshes[i].vb, byteSize);
        vCount += meshes[i].vbCount;
        iCount += meshes[i].ibCount;
    }

    this->_meshArray.push_back(merge);
}

uint32_t SkeletonObject::queryRenderDataInfo() {
    auto store = getStoreMem();
    int meshSize = _meshArray.size();
    //LogUtil::PrintIntValue(meshSize, "Mesh Size:");
    uint32_t* ptr = (uint32_t*)store->uint8Ptr;
    ptr[0] = meshSize;
    for (int i = 0; i < meshSize; i++) {
        *(++ptr) = _meshArray[i]->slotIndex;
        *(++ptr) = _meshArray[i]->vbCount;
        *(++ptr) = _meshArray[i]->ibCount;
        *(++ptr) = (uint32_t)_meshArray[i]->vb;
        *(++ptr) = (uint32_t)_meshArray[i]->ib;
    }

    return (uint32_t)store->uint8Ptr;
}

uint32_t SkeletonObject::setSkin(uint32_t start, uint32_t length)
{
    if (!_skeleton) return false;
    std::string skinName = DataConvert::Convert2StdString(start, length);
    _skeleton->setSkin(skinName.empty() ? nullptr : skinName.c_str());
    _skeleton->setSlotsToSetupPose();
    return true;
}

uint32_t SkeletonObject::setAnimation(uint32_t trackIndex, uint32_t start, uint32_t length, bool loop)
{
    std::string name = DataConvert::Convert2StdString(start, length);
    if (!_skeleton) return false;
    Animation *animation = _skeleton->getData()->findAnimation(name.c_str());
    if (!animation) {
        LogUtil::PrintToJs("Spine: Animation not found:!!!");
        return false;
    }
    auto *trackEntry = _animState->setAnimation(trackIndex, animation, loop);
    _animState->apply(*_skeleton);
    return true;
}

void SkeletonObject::clearTrack(uint32_t trackIndex) {
    _animState->clearTrack(trackIndex);
}

void SkeletonObject::clearTracks() {
    _animState->clearTracks();
}

void SkeletonObject::setToSetupPose(){
    _skeleton->setToSetupPose();
}

uint32_t SkeletonObject::setTimeScale(float timeScale)
{
    if (_animState) {
        _animState->setTimeScale(timeScale);
    }
    return true;
}

uint32_t SkeletonObject::updateAnimation(float dltTime) {
    if (!_skeleton) return false;
    _skeleton->update(dltTime);
    _animState->update(dltTime);
    _animState->apply(*_skeleton);
    _skeleton->updateWorldTransform();

    return true;
}

void SkeletonObject::setMix(uint32_t start, uint32_t fromLength, uint32_t toLength, float duration) {
    if (!_animStateData) return;

    spine::String fromName = DataConvert::Convert2SpineString(start, fromLength);
    spine::String toName = DataConvert::Convert2SpineString(start + fromLength, toLength);
    LogUtil::PrintToJs(fromName.buffer());
    _animStateData->setMix(fromName, toName, duration);
}

uint32_t SkeletonObject::getDrawOrderSize() {
    if (!_skeleton) return 0;
    auto count = (uint32_t)_skeleton->getDrawOrder().size();
    return count;
}

uint32_t SkeletonObject::getSlotNameByOrder(uint32_t index) {
    auto store = getStoreMem();
    uint32_t* pInfo = (uint32_t*)store->uint8Ptr;
    uint8_t* pData = store->uint8Ptr + 4;
    auto slots = _skeleton->getDrawOrder();
    auto attachment = slots[index]->getAttachment();
    if (!attachment) {
        pInfo[0] = 0;
        return (uint32_t)store->uint8Ptr;
    }
    auto name = attachment->getName();
    pInfo[0] = name.length();
    memcpy(pData, (const void *)name.buffer(), name.length());
    return (uint32_t)store->uint8Ptr;
}

uint32_t SkeletonObject::getBoneMatrix(uint32_t boneIdx) {
    auto store = getStoreMem();
    float* boneMat = (float*)store->uint8Ptr;
    auto bones = _skeleton->getBones();
    auto bone = bones[boneIdx];
    boneMat[0] = bone->getA();
    boneMat[1] = bone->getC();
    boneMat[2] = bone->getB();
    boneMat[3] = bone->getD();
    boneMat[4] = bone->getWorldX();
    boneMat[5] = bone->getWorldY();
    return (uint32_t)store->uint8Ptr;
}

bool SkeletonObject::setDefualtScale(float scale) {
    _userData.scale = scale;
    if (scale - 1.0 > 0.1F || scale - 1.0 < -0.1F) {
        _userData.doScale = true;
    }
    return true;
}

void SkeletonObject::resetMeshArray()
{
    int count = _meshArray.size();
    for (int i = 0; i < count; i++) {
        auto *mesh = _meshArray[i];
        mesh->FreeData();
        delete mesh;
    }
    _meshArray.clear();
}

void SkeletonObject::setVertexEffect(spine::VertexEffect *effect) {
    _effect = effect;
}

void SkeletonObject::setPremultipliedAlpha(bool premultipliedAlpha) {
    _userData.premultipliedAlpha = premultipliedAlpha;
}

void SkeletonObject::setColor(float r, float g, float b, float a) {
    _userData.color.r = r;
    _userData.color.g = g;
    _userData.color.b = b;
    _userData.color.a = a;
}

// create atlas test
uint32_t SkeletonObject::testFunc(uint32_t start, uint32_t length) {

    return true;
}


