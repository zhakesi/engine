#ifndef _SKELETON_OBJECT_H__
#define _SKELETON_OBJECT_H__

#include "spine/spine.h"
#include <stdint.h>
#include "SkMeshData.h"
#include "MeshDataDef.h"
#include <vector>

class SkeletonObject {
struct UserData
{
    bool doScale = false;
    bool doFillZ = true;
    float scale = 1.0F;
    bool premultipliedAlpha = true;
    Color4F color = Color4F(1.0F, 1.0F, 1.0F, 1.0F);
};

struct SpineMeshBlendInfo {
    uint32_t blendMode;
    uint32_t indexOffset;
    uint32_t indexCount;
};

public:
    SkeletonObject();
    ~SkeletonObject();
    uint32_t ObjectID();
    void     setSkeletonData(uint32_t datPtr);
    uint32_t updateRenderData();
    uint32_t setSkin(std::string& skinName);
    float    setAnimation(uint32_t trackIndex, std::string &animationName, bool loop);
    void     clearTrack(uint32_t trackIndex);
    void     clearTracks();
    void     setToSetupPose();
    uint32_t setTimeScale(float timeScale);
    uint32_t updateAnimation(float dltTime);
    void     setMix(uint32_t start, uint32_t fromLength, uint32_t toLength, float duration);
    uint32_t getDrawOrderSize();
    uint32_t getSlotNameByOrder(uint32_t index);
    uint32_t getBoneMatrix(uint32_t boneIdx);
    bool     setDefualtScale(float scale);
    void     setVertexEffect(spine::VertexEffect *effect);
    void     setPremultipliedAlpha(bool premultipliedAlpha);
    void     setColor(float r, float g, float b, float a);

private:
    void     collectMeshData(std::vector<SkMeshData> &meshArray);
    void     processVertices(std::vector<SkMeshData> &meshes);
    void     mergeMeshes(std::vector<SkMeshData> &meshArray, std::vector<SpineMeshBlendInfo> &blendInfos);
    void     releaseMeshData();
    uint32_t queryRenderDataInfo(std::vector<SpineMeshBlendInfo> &blendInfos);
private:
    uint32_t _objID;
    spine::Skeleton *_skeleton = nullptr;
    spine::SkeletonData *_skeletonData = nullptr;
    spine::AnimationStateData* _animStateData = nullptr;
    spine::AnimationState* _animState = nullptr;
    spine::SkeletonClipping* _clipper = nullptr;
    spine::VertexEffect *_effect = nullptr;

    SkMeshData* _mesh = nullptr;

    UserData _userData;
};

typedef SkeletonObject* SkeletonHandle;
SkeletonHandle getSkeletonHandle(uint32_t objID);
void           removeSkeletonHandle(uint32_t objID);

uint32_t       createSkeletonData(std::string& name, bool isJson);
uint32_t       retainSkeletonData(std::string& uuid);
void           recordSkeletonData(std::string& uuid, uint32_t datPtr);
#endif