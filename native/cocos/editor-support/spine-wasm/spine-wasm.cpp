#include <emscripten/emscripten.h>
#include "wasmSpineExtension.h"
#include "util-function.h"
#include "spine-mesh-data.h"

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE void spineWasmInit() {
    LogUtil::Initialize();
    spine::SpineExtension* tension = new WasmSpineExtension();
    WasmSpineExtension::RTTI_INIT();
    spine::SpineExtension::setInstance(tension);

    SpineMeshData::initMeshMemory();

    LogUtil::PrintToJs("spineWasmInit");
}

EMSCRIPTEN_KEEPALIVE void spineWasmInstanceDestroy() {
    auto* extension = spine::SpineExtension::getInstance();
    delete extension;
    SpineMeshData::releaseMeshMemory();
    LogUtil::ReleaseBuffer();
}

#ifdef __cplusplus 		  
}
#endif