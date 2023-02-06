#include "skeleton2d.h"
#include "core/platform/Debug.h"
#include "platform/FileUtils.h"
#include "cocos/editor-support/spine/spine.h"
#include "cocos/editor-support/spine-creator-support/spine-cocos2dx.h"
#include "cocos/editor-support/spine-creator-support/AttachmentVertices.h"


namespace cc {
namespace cspine {

Skeleton2D::Skeleton2D() {

}

Skeleton2D::~Skeleton2D() {
}

void Skeleton2D::initSkeletonData(ccstd::string &jsonStr, ccstd::string &atlasText) {
    spine::Atlas *atlas = new spine::Atlas(atlasText.c_str(), (int)atlasText.size(), "", nullptr, false);
    spine::AttachmentLoader *attachmentLoader = new spine::Cocos2dAtlasAttachmentLoader(atlas);
    spine::SkeletonJson json(attachmentLoader);
    json.setScale(1.0F);
    _skelData = json.readSkeletonData(jsonStr.c_str());

    _skeleton = new spine::Skeleton(_skelData);

    _animStateData = new spine::AnimationStateData(_skelData);

    _animState = new spine::AnimationState(_animStateData);

    _clipper = new spine::SkeletonClipping();

    _skeleton->setToSetupPose();
    _skeleton->updateWorldTransform();
}

void Skeleton2D::initSkeletonDataBinary(ccstd::string &dataPath, ccstd::string &atlasText) {
    spine::Atlas *atlas = new spine::Atlas(atlasText.c_str(), (int)atlasText.size(), "", nullptr, false);
    spine::AttachmentLoader *attachmentLoader = new spine::Cocos2dAtlasAttachmentLoader(atlas);

    auto fileUtils = cc::FileUtils::getInstance();
    if (!fileUtils->isFileExist(dataPath)) {
        CC_LOG_ERROR("file: %s not exist!!!", dataPath.c_str());
        return;
    }
    cc::Data dataBuffer;
    const auto fullpath = fileUtils->fullPathForFilename(dataPath);
    fileUtils->getContents(fullpath, &dataBuffer);

    spine::SkeletonBinary binary(attachmentLoader);
    binary.setScale(1.0F);
    _skelData = binary.readSkeletonData(dataBuffer.getBytes(), (int)dataBuffer.getSize());

    _skeleton = new spine::Skeleton(_skelData);

    _animStateData = new spine::AnimationStateData(_skelData);

    _animState = new spine::AnimationState(_animStateData);

    _clipper = new spine::SkeletonClipping();

    _skeleton->setToSetupPose();
    _skeleton->updateWorldTransform();
}

void Skeleton2D::setSkin(ccstd::string &name) {
    if (!_skeleton) return;
    _skeleton->setSkin(name.c_str());
    _skeleton->setSlotsToSetupPose();
}

void Skeleton2D::setAnimation (ccstd::string &name) {
    if (!_skeleton) return;
    spine::Animation *animation = _skeleton->getData()->findAnimation(name.c_str());
    if (!animation) {
        CC_LOG_DEBUG("Spine: Animation not found:!!!");
        return;
    }
    auto *trackEntry = _animState->setAnimation(0, animation, true);
    _animState->apply(*_skeleton);
    //CC_LOG_DEBUG("setAnimation:%s", name.c_str());
}

void Skeleton2D::updateAnimation(float dltTime) {
    if (!_skeleton) return;
    _skeleton->update(dltTime);
    _animState->update(dltTime);
    _animState->apply(*_skeleton);
    _skeleton->updateWorldTransform();
}

std::vector<Skeleton2DMesh *> &Skeleton2D::updateRenderData() {
    for (auto &m : _meshes) {
        delete m;
    }
    _meshes.clear();
    realTimeTraverse();
    processVertices();
    return _meshes;
}

void Skeleton2D::realTimeTraverse() {
    unsigned byteStride = sizeof(middleware::V3F_T2F_C4B);
    int startSlotIndex = -1;
    int endSlotIndex = -1;
    bool inRange = true;
    auto &drawOrder = _skeleton->getDrawOrder();
    int size = drawOrder.size();
    Skeleton2DMesh *currMesh = nullptr;
    for (int i = 0, n = drawOrder.size(); i < n; ++i) {
        middleware::Color4F color(1.0f, 1.0f, 1.0f, 1.0f);
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

        if (slot->getAttachment()->getRTTI().isExactly(spine::RegionAttachment::rtti)) {
            auto *attachment = dynamic_cast<spine::RegionAttachment *>(slot->getAttachment());
            auto *attachmentVertices = reinterpret_cast<spine::AttachmentVertices *>(attachment->getRendererObject());

            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto vbSize = vertCount * byteStride;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto ibSize = indexCount * sizeof(uint16_t);
            Skeleton2DMesh *mesh = currMesh = new Skeleton2DMesh(vertCount, indexCount, byteStride);
            memcpy(mesh->vertices.data(), static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            attachment->computeWorldVertices(slot->getBone(), mesh->vertices.data(), 0, byteStride / sizeof(float));
            memcpy(mesh->indices.data(), attachmentVertices->_triangles->indices, ibSize);
            _meshes.push_back(mesh);

            color.r = attachment->getColor().r;
            color.g = attachment->getColor().g;
            color.b = attachment->getColor().b;
            color.a = attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(spine::MeshAttachment::rtti)) {
            auto *attachment = dynamic_cast<spine::MeshAttachment *>(slot->getAttachment());
            auto *attachmentVertices = static_cast<spine::AttachmentVertices *>(attachment->getRendererObject());      

            auto vertCount = attachmentVertices->_triangles->vertCount;
            auto vbSize = vertCount * byteStride;
            auto indexCount = attachmentVertices->_triangles->indexCount;
            auto ibSize = indexCount * sizeof(uint16_t);
            Skeleton2DMesh *mesh = currMesh = new Skeleton2DMesh(vertCount, indexCount, byteStride);
            memcpy(mesh->vertices.data(), static_cast<void *>(attachmentVertices->_triangles->verts), vbSize);
            attachment->computeWorldVertices(*slot, 0, attachment->getWorldVerticesLength(), mesh->vertices.data(), 0, byteStride / sizeof(float));
            memcpy(mesh->indices.data(), attachmentVertices->_triangles->indices, ibSize);
            _meshes.push_back(mesh);

            color.r = attachment->getColor().r;
            color.g = attachment->getColor().g;
            color.b = attachment->getColor().b;
            color.a = attachment->getColor().a;
        } else if (slot->getAttachment()->getRTTI().isExactly(spine::ClippingAttachment::rtti)) {
            auto *clip = dynamic_cast<spine::ClippingAttachment *>(slot->getAttachment());
            _clipper->clipStart(*slot, clip);
            continue;
        } else {
            _clipper->clipEnd(*slot);
            continue;
        }

        bool premultipliedAlpha = false;
        color.a = _skeleton->getColor().a * slot->getColor().a * color.a;
        float multiplier = premultipliedAlpha ? color.a : 1.0f;
        color.r = _skeleton->getColor().r * slot->getColor().r * color.r * multiplier;
        color.g = _skeleton->getColor().g * slot->getColor().g * color.g * multiplier;
        color.b = _skeleton->getColor().b * slot->getColor().b * color.b * multiplier;

        if (_clipper->isClipping()) {

        } else {
            int vCount = currMesh->vCount;
            auto* vertex = reinterpret_cast<middleware::V3F_T2F_C4B *>(currMesh->vertices.data());
            for (int v = 0; v < vCount; ++v) {
                vertex[v].color.r = static_cast<uint8_t>(255 * color.r);
                vertex[v].color.g = static_cast<uint8_t> (255* color.g);
                vertex[v].color.b = static_cast<uint8_t> (255* color.b);
                vertex[v].color.a = static_cast<uint8_t> (255 *color.a);
            }
        }
        _clipper->clipEnd(*slot);
    }
    _clipper->clipEnd();
}

void Skeleton2D::processVertices() {
    unsigned byteStride = sizeof(middleware::V3F_T2F_C4B);
    int count = _meshes.size();
    float z_offset = 0.1f;
    for (int i = 0; i < count; i++) {
        auto mesh = _meshes[i];
        float *ptr = mesh->vertices.data();
        for (int m = 0; m < mesh->vCount; m++) {
            float *vert = ptr + m * mesh->byteStride / sizeof(float);
            vert[0] *= 0.01f;
            vert[1] *= 0.01f;
            vert[2] = z_offset;
        }
        z_offset += 0.01f;
    }
}

} // namespace cspine
} // namespace cc
