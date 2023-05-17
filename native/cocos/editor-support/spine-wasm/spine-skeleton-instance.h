#ifndef __SPINE_SKELETON_H__
#define __SPINE_SKELETON_H__
#include <spine/spine.h>
#include <string>
using namespace spine;

class SpineSkeletonInstance {
public:
    SpineSkeletonInstance();
    ~SpineSkeletonInstance();
    bool initSkeletonDataJson(const std::string& jsonStr, const std::string& altasStr);

private:
    spine::Skeleton *_skeleton = nullptr;
    spine::SkeletonData *_skeletonData = nullptr;
    spine::AnimationStateData* _animStateData = nullptr;
    spine::AnimationState* _animState = nullptr;
    spine::SkeletonClipping* _clipper = nullptr;
    spine::VertexEffect *_effect = nullptr;
};

#endif