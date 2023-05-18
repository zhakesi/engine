#include <vector>
#include <spine/spine.h>
#include "spine-skeleton-instance.h"
#include "AtlasAttachmentLoaderExtension.h"
#include "log-util.h"
#include "spine-mesh-data.h"

using namespace spine;
SpineSkeletonInstance::SpineSkeletonInstance()
{

}

SpineSkeletonInstance::~SpineSkeletonInstance()
{
    if (_clipper) delete _clipper;
    if (_animState) delete _animState;
    if (_animStateData) delete _animStateData;
    if (_skeleton) delete _skeleton;
    if (_skeletonData) delete _skeletonData;
}

spine::SkeletonData *SpineSkeletonInstance::initSkeletonDataJson(const std::string& jsonStr, const std::string& altasStr)
{
    auto* atlas = new Atlas(altasStr.c_str(), nullptr);
    if (!atlas) {
        LogUtil::PrintToJs("create atlas failed!!!");
        return nullptr;
    }
    AttachmentLoader *attachmentLoader = new AtlasAttachmentLoaderExtension(atlas);
    SkeletonJson* json = new SkeletonJson(attachmentLoader);
    _skeletonData = json->readSkeletonData(jsonStr.c_str());
    delete json;
    LogUtil::PrintToJs("initWithSkeletonData ok.");
    return _skeletonData;
}

Skeleton *SpineSkeletonInstance::initSkeleton() {
    _skeleton = new Skeleton(_skeletonData);

    _animStateData = new AnimationStateData(_skeletonData);

    _animState = new AnimationState(_animStateData);

    _clipper = new SkeletonClipping();

    _skeleton->setToSetupPose();
    _skeleton->updateWorldTransform();
    LogUtil::PrintToJs("initSkeleton ok.");
    return _skeleton;
}

void SpineSkeletonInstance::setAnimation(float trackIndex, const std::string& name, bool loop) {
    if (!_skeleton) return;
    spine::Animation *animation = _skeleton->getData()->findAnimation(name.c_str());
    if (!animation) {
        LogUtil::PrintToJs("Spine: Animation not found:!!!");
        _animState->clearTracks();
        _skeleton->setToSetupPose();
        return;
    }
    auto *trackEntry = _animState->setAnimation(0, animation, loop);
    _animState->apply(*_skeleton);
    return;
}

void SpineSkeletonInstance::setSkin(const std::string& name) {
    if (!_skeleton) return;
    _skeleton->setSlotsToSetupPose();
    _skeleton->setSkin(name.c_str());
}

void SpineSkeletonInstance::updateAnimation(float dltTime) {
    if (!_skeleton) return;
    _skeleton->update(dltTime);
    _animState->update(dltTime);
    _animState->apply(*_skeleton);
    _skeleton->updateWorldTransform();
}

void SpineSkeletonInstance::updateRenderData() {
    SpineMeshData::reset();

    uint32_t byteStride1 = sizeof(V3F_T2F_C4B);
    uint32_t byteStride2 = sizeof(V3F_T2F_C4B_C4B);

    Color4F color;
    auto &slotArray = _skeleton->getDrawOrder();
    uint32_t slotCount = slotArray.size();

    std::vector<SlotMesh> meshArray;
    SlotMesh currMesh;
    if (_effect) {
        _effect->begin(*_skeleton);
    }
    LogUtil::PrintIntValue(slotCount, "xxx-step 1 slotCount: ");
    for (uint32_t drawIdx = 0; drawIdx < slotCount; ++drawIdx) {
        auto slot = slotArray[drawIdx];
        if (slot->getBone().isActive() == false) {
            continue;
        }
        if (!slot->getAttachment()) {
            _clipper->clipEnd(*slot);
            continue;
        }
        LogUtil::PrintToJs("xxx-step 2");
        color.r = _userData.color.r;
        color.g = _userData.color.g;
        color.b = _userData.color.b;
        color.a = _userData.color.a;
        if (slot->getAttachment()->getRTTI().isExactly(spine::RegionAttachment::rtti)) {
            LogUtil::PrintToJs("xxx-step 3");
            auto *attachment = dynamic_cast<spine::RegionAttachment *>(slot->getAttachment());
            auto *attachmentVertices = reinterpret_cast<AttachmentVertices *>(attachment->getRendererObject());

            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto vbSize = vertCount * byteStride1;
            auto ibSize = indexCount * sizeof(uint16_t);

            auto *vertices = SpineMeshData::queryVBuffer();
            auto *indices = attachmentVertices->_triangles->indices;
            memcpy(static_cast<void *>(vertices), static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            attachment->computeWorldVertices(slot->getBone(), (float*)vertices, 0, byteStride1 / sizeof(float));

            currMesh = SlotMesh((uint8_t*)vertices, indices, vertCount, indexCount, byteStride1, slot->getData().getBlendMode());
            color.r *= attachment->getColor().r;
            color.g *= attachment->getColor().g;
            color.b *= attachment->getColor().b;
            color.a *= attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(spine::MeshAttachment::rtti)) {
            LogUtil::PrintToJs("xxx-step 4");
            auto *attachment = dynamic_cast<spine::MeshAttachment *>(slot->getAttachment());
            auto *attachmentVertices = static_cast<AttachmentVertices *>(attachment->getRendererObject());
   
            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto vbSize = vertCount * byteStride1;
            auto ibSize = indexCount * sizeof(uint16_t);

            auto *vertices = SpineMeshData::queryVBuffer();
            auto *indices = attachmentVertices->_triangles->indices;
            memcpy(static_cast<void *>(vertices), static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            attachment->computeWorldVertices(*slot, 0, attachment->getWorldVerticesLength(), (float*)vertices, 0, byteStride1 / sizeof(float));
            
            currMesh = SlotMesh((uint8_t*)vertices, indices, vertCount, indexCount, byteStride1, slot->getData().getBlendMode());
            color.r *= attachment->getColor().r;
            color.g *= attachment->getColor().g;
            color.b *= attachment->getColor().b;
            color.a *= attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(spine::ClippingAttachment::rtti)) {
            auto *clip = dynamic_cast<spine::ClippingAttachment *>(slot->getAttachment());
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
        uint32_t light = (uintA << 24) + (uintB << 16) + (uintG << 8) + uintR;

        if (_userData.useTint) {

        } else {
            if (_clipper->isClipping()) {
            } else {
                LogUtil::PrintToJs("xxx-step 5");
                int vCount = currMesh.vCount;
                LogUtil::PrintIntValue(vCount,"vert size: ");
                V3F_T2F_C4B *vertex = (V3F_T2F_C4B *)currMesh.vBuf;
                uint32_t* uPtr = (uint32_t*)currMesh.vBuf;
                if (_effect) {
                    for (int v = 0; v < vCount; ++v) {
                        _effect->transform(vertex[v].vertex.x, vertex[v].vertex.y);
                        uPtr[v * 6 + 5] = light;
                    }
                } else {
                    for (int v = 0; v < vCount; ++v) {
                        uPtr[v * 6 + 5] = light;
                    }
                }
            }
        }


        _clipper->clipEnd(*slot);
    }
    _clipper->clipEnd();
    if (_effect) _effect->end();
}
