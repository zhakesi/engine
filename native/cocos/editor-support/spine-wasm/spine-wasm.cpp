#include "spine-wasm.h"
#include "wasmSpineExtension.h"
#include "util-function.h"
#include "spine-mesh-data.h"
#include "AtlasAttachmentLoaderExtension.h"
#include <map>

std::map<std::string, SkeletonData*> skeletonDataMap {};

void SpineWasmUtil::spineWasmInit() {
    LogUtil::Initialize();
    spine::SpineExtension* tension = new WasmSpineExtension();
    WasmSpineExtension::RTTI_INIT();
    spine::SpineExtension::setInstance(tension);

    SpineMeshData::initMeshMemory();

    LogUtil::PrintToJs("spineWasmInit");
}

void SpineWasmUtil::spineWasmDestroy() {
    auto* extension = spine::SpineExtension::getInstance();
    delete extension;
    SpineMeshData::releaseMeshMemory();
    LogUtil::ReleaseBuffer();
}

SkeletonData* SpineWasmUtil::querySpineSkeletonDataByUUID(const std::string& uuid) {
    auto iter = skeletonDataMap.find(uuid);
    if (iter == skeletonDataMap.end()) {
        return nullptr;
    }
    SkeletonData* ptrVal = iter->second;
    return ptrVal;
}

SkeletonData* SpineWasmUtil::createSpineSkeletonDataWithJson(const std::string& jsonStr, const std::string& altasStr) {
    auto* atlas = new Atlas(altasStr.c_str(), altasStr.size(),"", nullptr, false);
    if (!atlas) {
        LogUtil::PrintToJs("create atlas failed!!!");
        return nullptr;
    }
    AttachmentLoader *attachmentLoader = new AtlasAttachmentLoaderExtension(atlas);
    spine::SkeletonJson json(attachmentLoader);
    json.setScale(1.0F);
    SkeletonData *skeletonData = json.readSkeletonData(jsonStr.c_str());
    LogUtil::PrintToJs("initWithSkeletonData ok.");
    return skeletonData;
}

void SpineWasmUtil::registerSpineSkeletonDataWithUUID(SkeletonData* data, const std::string& uuid) {
    auto iter = skeletonDataMap.find(uuid);
    if (iter == skeletonDataMap.end()) {
        skeletonDataMap[uuid] = data;
    }
}

void SpineWasmUtil::destroySpineSkeletonDataWithUUID(const std::string& uuid) {
    auto iter = skeletonDataMap.find(uuid);
    if (iter != skeletonDataMap.end()) {
        auto *data = skeletonDataMap[uuid];
        delete data;
        skeletonDataMap.erase(iter);
    }
}