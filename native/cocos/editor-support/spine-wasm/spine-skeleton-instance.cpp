#include <vector>
#include <spine/spine.h>
#include "spine-skeleton-instance.h"
#include "AtlasAttachmentLoaderExtension.h"
#include "util-function.h"
#include "spine-mesh-data.h"

using namespace spine;
SpineSkeletonInstance::SpineSkeletonInstance()
{
    _model = new SpineModel();
}

SpineSkeletonInstance::~SpineSkeletonInstance()
{
    if (_clipper) delete _clipper;
    if (_animState) delete _animState;
    if (_animStateData) delete _animStateData;
    if (_skeleton) delete _skeleton;
    if (_skeletonData) delete _skeletonData;
    if (_model) delete _model;
}

spine::SkeletonData *SpineSkeletonInstance::initSkeletonDataJson(const std::string& jsonStr, const std::string& altasStr)
{
    auto* atlas = new Atlas(altasStr.c_str(), altasStr.size(),"", nullptr, false);
    if (!atlas) {
        LogUtil::PrintToJs("create atlas failed!!!");
        return nullptr;
    }
    AttachmentLoader *attachmentLoader = new AtlasAttachmentLoaderExtension(atlas);
    spine::SkeletonJson json(attachmentLoader);
    json.setScale(1.0F);
    _skeletonData = json.readSkeletonData(jsonStr.c_str());
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
    LogUtil::PrintToJs(name.c_str());
}

void SpineSkeletonInstance::updateAnimation(float dltTime) {
    if (!_skeleton) return;
    _skeleton->update(dltTime);
    _animState->update(dltTime);
    _animState->apply(*_skeleton);
    _skeleton->updateWorldTransform();
}

SpineModel* SpineSkeletonInstance::updateRenderData() {
    _skeleton->updateWorldTransform();
    SpineMeshData::reset();
    _model->clearMeshes();

    collectMeshData();

    _model->setBufferPtr(SpineMeshData::vb(), SpineMeshData::ib());
    return _model;
}


void SpineSkeletonInstance::collectMeshData() {
    uint32_t byteStrideOneColor = sizeof(V3F_T2F_C4B);
    uint32_t byteStrideTwoColor = sizeof(V3F_T2F_C4B_C4B);

    Color4F color;
    auto &slotArray = _skeleton->getDrawOrder();
    uint32_t slotCount = slotArray.size();

    SlotMesh currMesh;
    if (_effect) {
        _effect->begin(*_skeleton);
    }
    for (uint32_t drawIdx = 0; drawIdx < slotCount; ++drawIdx) {
        auto slot = slotArray[drawIdx];
        if (slot->getBone().isActive() == false) {
            continue;
        }

        if (!slot->getAttachment()) {
            _clipper->clipEnd(*slot);
            continue;
        }
        color.r = _userData.color.r;
        color.g = _userData.color.g;
        color.b = _userData.color.b;
        color.a = _userData.color.a;
        if (slot->getAttachment()->getRTTI().isExactly(spine::RegionAttachment::rtti)) {
            auto *attachment = dynamic_cast<spine::RegionAttachment *>(slot->getAttachment());
            auto *attachmentVertices = reinterpret_cast<AttachmentVertices *>(attachment->getRendererObject());

            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto vbSize = vertCount * byteStrideOneColor;
            auto ibSize = indexCount * sizeof(uint16_t);

            auto *vertices = SpineMeshData::queryVBuffer(vbSize);
            auto *indices = SpineMeshData::queryIBuffer(indexCount);
            memcpy(static_cast<void *>(vertices), static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            memcpy(indices, attachmentVertices->_triangles->indices, ibSize);
            attachment->computeWorldVertices(slot->getBone(), (float*)vertices, 0, byteStrideOneColor / sizeof(float));
            currMesh = SlotMesh((uint8_t*)vertices, indices, vertCount, indexCount, slot->getData().getBlendMode());

            color.r *= attachment->getColor().r;
            color.g *= attachment->getColor().g;
            color.b *= attachment->getColor().b;
            color.a *= attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(spine::MeshAttachment::rtti)) {
            auto *attachment = dynamic_cast<spine::MeshAttachment *>(slot->getAttachment());
            auto *attachmentVertices = static_cast<AttachmentVertices *>(attachment->getRendererObject());
   
            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto vbSize = vertCount * byteStrideOneColor;
            auto ibSize = indexCount * sizeof(uint16_t);

            auto *vertices = SpineMeshData::queryVBuffer(vbSize);
            auto *indices = SpineMeshData::queryIBuffer(indexCount);
            memcpy(static_cast<void *>(vertices), static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            memcpy(indices, attachmentVertices->_triangles->indices, ibSize);
            attachment->computeWorldVertices(*slot, 0, attachment->getWorldVerticesLength(), (float*)vertices, 0, byteStrideOneColor / sizeof(float));
            currMesh = SlotMesh((uint8_t*)vertices, indices, vertCount, indexCount, slot->getData().getBlendMode());
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

        uint32_t uintA = (uint32_t)(255 * _skeleton->getColor().a * slot->getColor().a * color.a);
        uint32_t multiplier = _userData.premultipliedAlpha ? uintA : 255;
        uint32_t uintR = (uint32_t)(_skeleton->getColor().r * slot->getColor().r * color.r * multiplier);
        uint32_t uintG = (uint32_t)(_skeleton->getColor().g * slot->getColor().g * color.g * multiplier);
        uint32_t uintB = (uint32_t)(_skeleton->getColor().b * slot->getColor().b * color.b * multiplier);
        uint32_t light = (uintA << 24) + (uintB << 16) + (uintG << 8) + uintR;

        if (_userData.useTint) {

        } else {
            if (_clipper->isClipping()) {
                _clipper->clipTriangles(reinterpret_cast<float *>(currMesh.vBuf), currMesh.iBuf, currMesh.iCount, (float*)(&currMesh.vBuf[3*4]), byteStrideOneColor / sizeof(float));

                if (_clipper->getClippedTriangles().size() == 0) {
                    _clipper->clipEnd(*slot);
                    continue;
                }
                auto vertCount = static_cast<int>(_clipper->getClippedVertices().size()) >> 1;
                auto indexCount = static_cast<int>(_clipper->getClippedTriangles().size());
                auto vbSize = vertCount * byteStrideOneColor;
                uint8_t* vPtr = SpineMeshData::queryVBuffer(vbSize);
                uint16_t* iPtr = SpineMeshData::queryIBuffer(indexCount);
                currMesh = SlotMesh(vPtr, iPtr, vertCount, indexCount, slot->getData().getBlendMode());
                memcpy(iPtr, _clipper->getClippedTriangles().buffer(), sizeof(uint16_t) * indexCount);
                
                float *verts = _clipper->getClippedVertices().buffer();
                float *uvs = _clipper->getClippedUVs().buffer();
                V3F_T2F_C4B *vertices = (V3F_T2F_C4B *)currMesh.vBuf;
                if (_effect) {
                    for (int v = 0, vn = vertCount, vv = 0; v < vn; ++v, vv += 2) {
                        vertices[v].vertex.x = verts[vv];
                        vertices[v].vertex.y = verts[vv + 1];
                        vertices[v].texCoord.u = uvs[vv];
                        vertices[v].texCoord.v = uvs[vv + 1];
                        _effect->transform(vertices[v].vertex.x, vertices[v].vertex.y);
                        *((uint32_t*)&vertices[v].color) = light;
                    }
                } else {
                    for (int v = 0, vn = vertCount, vv = 0; v < vn; ++v, vv += 2) {
                        vertices[v].vertex.x = verts[vv];
                        vertices[v].vertex.y = verts[vv + 1];
                        vertices[v].texCoord.u = uvs[vv];
                        vertices[v].texCoord.v = uvs[vv + 1];
                        *((uint32_t*)&vertices[v].color) = light;
                    }
                }
            } else {
                auto vertCount = currMesh.vCount;
                V3F_T2F_C4B *vertex = (V3F_T2F_C4B *)currMesh.vBuf;
                uint32_t* uPtr = (uint32_t*)currMesh.vBuf;
                if (_effect) {
                    for (int v = 0; v < vertCount; ++v) {
                        _effect->transform(vertex[v].vertex.x, vertex[v].vertex.y);
                        uPtr[v * 6 + 5] = light;
                    }
                } else {
                    for (int v = 0; v < vertCount; ++v) {
                        uPtr[v * 6 + 5] = light;
                    }
                }
            }
        }

        auto stride = _userData.useTint ? byteStrideTwoColor : byteStrideOneColor;
        SpineMeshData::moveVB(currMesh.vCount * stride);
        SpineMeshData::moveIB(currMesh.iCount);
        
        _model->addSlotMesh(currMesh);

        _clipper->clipEnd(*slot);
    }
    _clipper->clipEnd();
    if (_effect) _effect->end();
}

void SpineSkeletonInstance::setPremultipliedAlpha(bool val) {
    _userData.premultipliedAlpha = val;
}