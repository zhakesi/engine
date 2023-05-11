#include <emscripten/emscripten.h>
#include <stdint.h>
#include "share-mem.h"
#include "LogUtil.h"
#include "SkeletonObject.h"
#include "wasmSpineExtension.h"


#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE bool spineWasmInstanceInit() {
    getStoreMemory();
    spine::SpineExtension* tension = new WasmSpineExtension();
    WasmSpineExtension::RTTI_INIT();
    spine::SpineExtension::setInstance(tension);
    LogUtil::Initialize();
    return true;
}

EMSCRIPTEN_KEEPALIVE bool spineWasmInstanceDestroy() {
    auto* extension = spine::SpineExtension::getInstance();
    delete extension;
    LogUtil::ReleaseBuffer();
    freeStoreMemory();
    return true;
}

EMSCRIPTEN_KEEPALIVE uint8_t* queryStoreMemory() {
    uint8_t* uint8Ptr = getStoreMemory();
    return uint8Ptr;
}

EMSCRIPTEN_KEEPALIVE uint32_t createSkeletonObject() {
    auto* objPtr = new SkeletonObject;
    uint32_t address = (uint32_t)objPtr;
    return address;
}

EMSCRIPTEN_KEEPALIVE void setSkeletonData(uint32_t objPtr, uint32_t datPtr) {
    auto handle = (SkeletonHandle)objPtr;
    handle->setSkeletonData(datPtr);
}

EMSCRIPTEN_KEEPALIVE bool setAnimation(uint32_t objPtr, uint32_t length, uint32_t trackIndex, bool loop) {
    auto handle = (SkeletonHandle)objPtr;
    char* data = (char*)getStoreMemory();
    std::string animation(data, length);
    return handle->setAnimation(trackIndex, animation, loop);
}

EMSCRIPTEN_KEEPALIVE void clearTrack(uint32_t objPtr, uint32_t trackIndex) {
    auto handle = (SkeletonHandle)objPtr;
    handle->clearTrack(trackIndex);
}

EMSCRIPTEN_KEEPALIVE void clearTracks(uint32_t objPtr) {
    auto handle = (SkeletonHandle)objPtr;
    handle->clearTracks();
}

EMSCRIPTEN_KEEPALIVE void setToSetupPose(uint32_t objPtr) {
    auto handle = (SkeletonHandle)objPtr;
    handle->setToSetupPose();
}

EMSCRIPTEN_KEEPALIVE void setSlotsToSetupPose(uint32_t objPtr) {
    auto handle = (SkeletonHandle)objPtr;
    handle->setSlotsToSetupPose();
}

EMSCRIPTEN_KEEPALIVE void setBonesToSetupPose(uint32_t objPtr) {
    auto handle = (SkeletonHandle)objPtr;
    handle->setBonesToSetupPose();
}

EMSCRIPTEN_KEEPALIVE bool setTimeScale(uint32_t objPtr, float timeScale) {
    auto handle = (SkeletonHandle)objPtr;
    handle->setTimeScale(timeScale);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t setSkin(uint32_t objPtr, uint32_t length) {
    char* data = (char*)getStoreMemory();
    std::string skin(data, length);
    auto handle = (SkeletonHandle)objPtr;
    handle->setSkin(skin);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t updateAnimation(uint32_t objPtr, float dltTime) {
    auto handle = (SkeletonHandle)objPtr;
    handle->updateAnimation(dltTime);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t updateRenderData(uint32_t objPtr) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->updateRenderData();
}

EMSCRIPTEN_KEEPALIVE uint32_t getDrawOrderSize(uint32_t objPtr) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->getDrawOrderSize();
}

EMSCRIPTEN_KEEPALIVE uint32_t getSlotNameByOrder(uint32_t objPtr, uint32_t index) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->getSlotNameByOrder(index);
}

EMSCRIPTEN_KEEPALIVE uint32_t getBoneMatrix(uint32_t objPtr, uint32_t index) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->getBoneMatrix(index);
}

EMSCRIPTEN_KEEPALIVE bool setDefaultScale(uint32_t objPtr, float scale) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->setDefualtScale(scale);
}

EMSCRIPTEN_KEEPALIVE bool setVertexEffect(uint32_t objPtr, uint32_t effectHandle, uint32_t effectType) {
    auto handle = (SkeletonHandle)objPtr;
    spine::VertexEffect* effect = nullptr;
    if (effectHandle > 0) effect = (spine::VertexEffect*)effectHandle;
    handle->setVertexEffect(effect);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t createJitterVertexEffect(float x, float y) {
    spine::VertexEffect* effect = nullptr;
    effect = new spine::JitterVertexEffect(x, y);
    return (uint32_t)effect;
}

EMSCRIPTEN_KEEPALIVE bool updateJitterParameters(uint32_t ptr, float x, float y) {
    spine::JitterVertexEffect* effect = (spine::JitterVertexEffect*)ptr;
    effect->setJitterX(x);
    effect->setJitterY(y);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t createSwirlVertexEffect(float radius, int power, bool usePowerOut) {
    spine::VertexEffect* effect = nullptr;
    spine::Interpolation* interpolation = nullptr;
    if (usePowerOut) {
        interpolation = new spine::PowOutInterpolation(power);
    } else {
        interpolation = new spine::PowInterpolation(power);
    }
    effect = new spine::SwirlVertexEffect(radius, *interpolation);
    return (uint32_t)effect;
}

EMSCRIPTEN_KEEPALIVE bool updateSwirlParameters(uint32_t ptr, float x, float y, float radius, float angle) {
    spine::SwirlVertexEffect* effect = (spine::SwirlVertexEffect*)ptr;
    effect->setCenterX(x);
    effect->setCenterY(y);
    effect->setRadius(radius);
    effect->setAngle(angle);
    return true;
}

EMSCRIPTEN_KEEPALIVE void setMix(uint32_t objPtr, uint32_t start, uint32_t fromLength, uint32_t toLength, float duration) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->setMix(start, fromLength, toLength, duration);
}

EMSCRIPTEN_KEEPALIVE void setPremultipliedAlpha(uint32_t objPtr, bool premultipliedAlpha) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->setPremultipliedAlpha(premultipliedAlpha);
}

EMSCRIPTEN_KEEPALIVE void setColor(uint32_t objPtr, float r, float g, float b, float a) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->setColor(r, g, b, a);
}

EMSCRIPTEN_KEEPALIVE void setAttachment(uint32_t objPtr, uint32_t start, uint32_t length1, uint32_t length2) {
    auto handle = (SkeletonHandle)objPtr;
    return handle->setAttachment(start, length1, length2);
}

EMSCRIPTEN_KEEPALIVE void destroyInstance(uint32_t objPtr) {
    auto handle = (SkeletonHandle)objPtr;
    delete handle;
}

EMSCRIPTEN_KEEPALIVE uint32_t initSkeletonData(uint32_t length, bool isJosn) {
    char* data = (char*)getStoreMemory();
    std::string name(data, length);
    uint32_t datPtr = createSkeletonData(name, isJosn);
    return datPtr;
}

EMSCRIPTEN_KEEPALIVE uint32_t retainSkeletonDataByUUID(uint32_t length) {
    char* data = (char*)getStoreMemory();
    std::string uuid(data, length);
    uint32_t datPtr = retainSkeletonData(uuid);
    return datPtr;
}

EMSCRIPTEN_KEEPALIVE void recordSkeletonDataUUID(uint32_t length, uint32_t datPtr) {
    char* data = (char*)getStoreMemory();
    std::string uuid(data, length);
    recordSkeletonData(uuid, datPtr);
}

EMSCRIPTEN_KEEPALIVE uint8_t* queryMemory(uint32_t size) {
    uint8_t* ptr = new uint8_t[size];
    return ptr;
}

EMSCRIPTEN_KEEPALIVE void freeMemory(uint8_t* ptr) {
    return delete[]ptr;
}

#ifdef __cplusplus 		  
}
#endif