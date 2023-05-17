#ifndef __SPINE_SKELETON_H__
#define __SPINE_SKELETON_H__
#include <spine/spine.h>
#include <string>
using namespace spine;

class SpineSkeletonInstance {
public:
    SpineSkeletonInstance();
    ~SpineSkeletonInstance();
    SkeletonData *initSkeletonDataJson(const std::string& jsonStr, const std::string& altasStr);
    Skeleton *initSkeleton();
    void setAnimation(float trackIndex, const std::string& name, bool loop);
    void setSkin(const std::string& name);
    void updateAnimation(float dltTime);
    void updateRenderData();

private:
    Skeleton *_skeleton = nullptr;
    SkeletonData *_skeletonData = nullptr;
    AnimationStateData* _animStateData = nullptr;
    AnimationState* _animState = nullptr;
    SkeletonClipping* _clipper = nullptr;
    VertexEffect *_effect = nullptr;
};

#endif