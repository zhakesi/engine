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

bool SpineSkeletonInstance::initSkeletonDataJson(const std::string& jsonStr, const std::string& altasStr)
{
    auto* atlas = new Atlas(altasStr.c_str(), nullptr);
    if (!atlas) {
        LogUtil::PrintToJs("create atlas failed!!!");
        return false;
    }
    AttachmentLoader *attachmentLoader = new AtlasAttachmentLoaderExtension(atlas);
    SkeletonJson* json = new SkeletonJson(attachmentLoader);
    _skeletonData = json->readSkeletonData(jsonStr.c_str());
    delete json;

    _skeleton = new Skeleton(_skeletonData);

    _animStateData = new AnimationStateData(_skeletonData);

    _animState = new AnimationState(_animStateData);

    _clipper = new SkeletonClipping();

    _skeleton->setToSetupPose();
    _skeleton->updateWorldTransform();

    LogUtil::PrintToJs("initWithSkeletonData ok.");
    return true;
}