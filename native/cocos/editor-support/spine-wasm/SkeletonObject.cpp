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
    resetMeshArray();

    unsigned int byteStride = sizeof(V3F_T2F_C4B);
    SkMeshData* currMesh = nullptr;
    int startSlotIndex = -1;
    int endSlotIndex = -1;
    bool inRange = true;
    auto &drawOrder = _skeleton->getDrawOrder();
    int drawCount = drawOrder.size();

    if (_effect) {
        _effect->begin(*_skeleton);
    }

    for (int i = 0, n = drawCount; i < n; ++i) {
        Color4F color(1.0f, 1.0f, 1.0f, 1.0f);
        auto slot = drawOrder[i];
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
            SkMeshData* mesh = currMesh = new SkMeshData(vertCount, indexCount, stride);
            mesh->userData.slotIndex = i;
            memcpy(mesh->vb, static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            attachment->computeWorldVertices(slot->getBone(),(float *)mesh->vb, 0, stride / sizeof(float));
            memcpy(mesh->ib, attachmentVertices->_triangles->indices, ibSize);
            _meshArray.push_back(mesh);

            color.r = attachment->getColor().r;
            color.g = attachment->getColor().g;
            color.b = attachment->getColor().b;
            color.a = attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(MeshAttachment::rtti)) {
            auto *attachment = dynamic_cast<MeshAttachment *>(slot->getAttachment());
            auto *attachmentVertices = static_cast<AttachmentVertices *>(attachment->getRendererObject());      

            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto vbSize = vertCount * byteStride;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto ibSize = indexCount * sizeof(uint16_t);
            SkMeshData* mesh = currMesh = new SkMeshData(vertCount, indexCount, byteStride);
            mesh->userData.slotIndex = i;
            memcpy(mesh->vb, static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            attachment->computeWorldVertices(*slot, 0, attachment->getWorldVerticesLength(), (float *)mesh->vb, 0, byteStride / sizeof(float));
            memcpy(mesh->ib, attachmentVertices->_triangles->indices, ibSize);
            _meshArray.push_back(mesh);

            color.r = attachment->getColor().r;
            color.g = attachment->getColor().g;
            color.b = attachment->getColor().b;
            color.a = attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(ClippingAttachment::rtti)) {
            auto *clip = dynamic_cast<ClippingAttachment *>(slot->getAttachment());
            _clipper->clipStart(*slot, clip);
            continue;
        } else {
            _clipper->clipEnd(*slot);
            continue;
        }

        bool premultipliedAlpha = false;
        color.a = _skeleton->getColor().a * slot->getColor().a * color.a;
        float multiplier = premultipliedAlpha ? color.a : 1.0f;
        color.r = _skeleton->getColor().r * slot->getColor().r * color.r * multiplier ;
        color.g = _skeleton->getColor().g * slot->getColor().g * color.g * multiplier;
        color.b = _skeleton->getColor().b * slot->getColor().b * color.b * multiplier;

        if (_clipper->isClipping()) {

        } else {
            int vCount = currMesh->vbCount;
            V3F_T2F_C4B *vertex = (V3F_T2F_C4B *)currMesh->vb;
            if (_effect) {
                for (int v = 0; v < vCount; ++v) {
                    _effect->transform(vertex[v].vertex.x, vertex[v].vertex.y);
                    vertex[v].color = color;
                }
            } else {
                for (int v = 0; v < vCount; ++v) {
                    vertex[v].color = color;
                }
            }
        }
        _clipper->clipEnd(*slot);
    }
    _clipper->clipEnd();
    if (_effect) _effect->end();

    processVertices();
    return true;
}

void SkeletonObject::processVertices()
{
   int count = _meshArray.size();
    if (userData.doScale && userData.doFillZ) {
        float scale = userData.scale;
        float zoffset = 0;
        for (int i = 0; i < count; i++) {
            auto mesh = _meshArray[i];
            float *ptr = (float *)mesh->vb;
            for (int m = 0; m < mesh->vbCount; m++) {
                float *vert = ptr + m * mesh->stride / sizeof(float);
                vert[0] *= scale;
                vert[1] *= scale;
                vert[2] = zoffset;
            }
            zoffset += 0.01F;
        }
    } else if (userData.doScale && !userData.doFillZ) {
        float scale = userData.scale;
        float zValue = 0;
        for (int i = 0; i < count; i++) {
            auto mesh = _meshArray[i];
            float *ptr = (float *)mesh->vb;
            for (int m = 0; m < mesh->vbCount; m++) {
                float *vert = ptr + m * mesh->stride / sizeof(float);
                vert[0] *= scale;
                vert[1] *= scale;
                vert[2] = zValue;
            }
        }
    } else if (!userData.doScale && userData.doFillZ) {
        float zoffset = 0;
        for (int i = 0; i < count; i++) {
            auto mesh = _meshArray[i];
            float *ptr = (float *)mesh->vb;
            for (int m = 0; m < mesh->vbCount; m++) {
                float *vert = ptr + m * mesh->stride / sizeof(float);
                vert[2] = zoffset;
            }
            zoffset = 0;
        }
    }
}

uint32_t SkeletonObject::queryRenderDataInfo() {
    auto store = getStoreMem();
    int meshSize = _meshArray.size();
    //LogUtil::PrintIntValue(meshSize, "Mesh Size:");
    uint32_t* ptr = (uint32_t*)store->uint8Ptr;
    ptr[0] = meshSize;
    for (int i = 0; i < meshSize; i++) {
        *(++ptr) = _meshArray[i]->userData.slotIndex;
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
    userData.scale = scale;
    if (scale - 1.0 > 0.1F || scale - 1.0 < -0.1F) {
        userData.doScale = true;
    }
    return true;
}

void SkeletonObject::resetMeshArray()
{
    int count = _meshArray.size();
    for (int i = 0; i < count; i++) {
        auto *mesh = _meshArray[i];
        delete mesh;
    }
    _meshArray.clear();
}

void SkeletonObject::setVertexEffect(spine::VertexEffect *effect) {
    _effect = effect;
}

// create atlas test
uint32_t SkeletonObject::testFunc(uint32_t start, uint32_t length) {

    return true;
}


