#include "skeleton2d.h"
#include "core/platform/Debug.h"
#include "cocos/editor-support/spine/spine.h"
#include "cocos/editor-support/spine-creator-support/spine-cocos2dx.h"


namespace cc {
namespace cspine {

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

}
}
