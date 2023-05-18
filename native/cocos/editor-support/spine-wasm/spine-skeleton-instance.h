#ifndef __SPINE_SKELETON_H__
#define __SPINE_SKELETON_H__
#include <spine/spine.h>
#include "mesh-type-define.h"
#include <string>
using namespace spine;

class SlotMesh {
public:
    SlotMesh() {}
    SlotMesh(uint8_t* vb, uint16_t* ib, uint32_t vc, uint32_t ic, uint32_t stride, BlendMode blend)
        :vBuf(vb), iBuf(ib), vCount(vc), iCount(ic), byteStride(stride), blendMode(blend) {}
    ~SlotMesh() {}
    uint8_t  *vBuf;
    uint16_t *iBuf;
    uint32_t vCount;
    uint32_t iCount;
    uint32_t byteStride;
    BlendMode blendMode;
};


class SpineSkeletonInstance {
    struct UserData {
        bool useTint = false;
        bool premultipliedAlpha = true;
        Color4F color = Color4F(1.0F, 1.0F, 1.0F, 1.0F);
    };

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
    UserData _userData;
};

#endif