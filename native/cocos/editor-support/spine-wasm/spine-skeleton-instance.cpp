//#include "SkeletonObject.h"
#include <spine/spine.h>
#include "spine-skeleton-instance.h"
#include "AtlasAttachmentLoaderExtension.h"
#include "log-util.h"

using namespace spine;
SpineSkeletonInstance::SpineSkeletonInstance()
{

}

SpineSkeletonInstance::~SpineSkeletonInstance()
{

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
    int startSlotIndex = -1;
    int endSlotIndex = -1;
    bool inRange = true;
    auto &drawOrder = _skeleton->getDrawOrder();
    int drawCount = drawOrder.size();
    LogUtil::PrintIntValue(drawCount, "draw slot size");
    if (_effect) {
        _effect->begin(*_skeleton);
    }
    for (uint32_t drawIdx = 0, n = drawCount; drawIdx < n; ++drawIdx) {

    }
    if (_effect) _effect->end();
}
