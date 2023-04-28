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
    return true;
}

EMSCRIPTEN_KEEPALIVE uint8_t* queryStoreMemory() {
    uint8_t* uint8Ptr = getStoreMemory();
    return uint8Ptr;
}

EMSCRIPTEN_KEEPALIVE uint32_t createSkeletonObject() {
    auto* obj = new SkeletonObject;
    return obj->ObjectID();
}

EMSCRIPTEN_KEEPALIVE uint32_t setSkeletonData(uint32_t objID, bool isJosn, uint32_t start, uint32_t length) {
    auto handle = getSkeletonHandle(objID);
    return handle->initWithSkeletonData(isJosn, start, length);
}

EMSCRIPTEN_KEEPALIVE float setAnimation(uint32_t objID, uint32_t start, uint32_t length, uint32_t trackIndex, bool loop) {
    auto handle = getSkeletonHandle(objID);
    return handle->setAnimation(trackIndex, start, length, loop);
}

EMSCRIPTEN_KEEPALIVE bool clearTrack(uint32_t objID, uint32_t trackIndex) {
    auto handle = getSkeletonHandle(objID);
    handle->clearTrack(trackIndex);
    return true;
}

EMSCRIPTEN_KEEPALIVE bool clearTracks(uint32_t objID) {
    auto handle = getSkeletonHandle(objID);
    handle->clearTracks();
    return true;
}

EMSCRIPTEN_KEEPALIVE bool setToSetupPose(uint32_t objID) {
    auto handle = getSkeletonHandle(objID);
    handle->setToSetupPose();
    return true;
}

EMSCRIPTEN_KEEPALIVE bool setTimeScale(uint32_t objID, float timeScale) {
    auto handle = getSkeletonHandle(objID);
    handle->setTimeScale(timeScale);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t setSkin(uint32_t objID, uint32_t start, uint32_t length) {
    auto handle = getSkeletonHandle(objID);
    handle->setSkin(start, length);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t updateAnimation(uint32_t objID, float dltTime) {
    auto handle = getSkeletonHandle(objID);
    handle->updateAnimation(dltTime);
    return true;
}

EMSCRIPTEN_KEEPALIVE uint32_t updateRenderData(uint32_t objID) {
    auto handle = getSkeletonHandle(objID);
    return handle->updateRenderData();
}

EMSCRIPTEN_KEEPALIVE uint32_t getDrawOrderSize(uint32_t objID) {
    auto handle = getSkeletonHandle(objID);
    return handle->getDrawOrderSize();
}

EMSCRIPTEN_KEEPALIVE uint32_t getSlotNameByOrder(uint32_t objID, uint32_t index) {
    auto handle = getSkeletonHandle(objID);
    return handle->getSlotNameByOrder(index);
}

EMSCRIPTEN_KEEPALIVE uint32_t getBoneMatrix(uint32_t objID, uint32_t index) {
    auto handle = getSkeletonHandle(objID);
    return handle->getBoneMatrix(index);
}

EMSCRIPTEN_KEEPALIVE bool setDefaultScale(uint32_t objID, float scale) {
    auto handle = getSkeletonHandle(objID);
    return handle->setDefualtScale(scale);
}

EMSCRIPTEN_KEEPALIVE bool setVertexEffect(uint32_t objID, uint32_t effectHandle, uint32_t effectType) {
    auto handle = getSkeletonHandle(objID);
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

EMSCRIPTEN_KEEPALIVE void setMix(uint32_t objID, uint32_t start, uint32_t fromLength, uint32_t toLength, float duration) {
    auto handle = getSkeletonHandle(objID);
    return handle->setMix(start, fromLength, toLength, duration);
}

EMSCRIPTEN_KEEPALIVE void setPremultipliedAlpha(uint32_t objID, bool premultipliedAlpha) {
    auto handle = getSkeletonHandle(objID);
    return handle->setPremultipliedAlpha(premultipliedAlpha);
}

EMSCRIPTEN_KEEPALIVE void setColor(uint32_t objID, float r, float g, float b, float a) {
    auto handle = getSkeletonHandle(objID);
    return handle->setColor(r, g, b, a);
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