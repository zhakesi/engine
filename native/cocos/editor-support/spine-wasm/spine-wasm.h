
#ifndef _SPINE_WASM_H_
#define _SPINE_WASM_H_
#include <spine/spine.h>
#include "spine-skeleton-instance.h"
#include <string>
using namespace spine;

class SpineWasmUtil {
public:
    static void spineWasmInit();
    static void spineWasmDestroy();

    static SkeletonData*   querySpineSkeletonDataByUUID(const std::string& uuid);
    static SkeletonData*   createSpineSkeletonDataWithJson(const std::string& jsonStr, const std::string& altasStr);
    static void            registerSpineSkeletonDataWithUUID(SkeletonData* data, const std::string& uuid);
    static void            destroySpineSkeletonDataWithUUID(const std::string& uuid);
    static void            destroySpineInstance(SpineSkeletonInstance* instance);

    static uint32_t getCurrentListenerID();
    static EventType getCurrentEventType();
    static TrackEntry* getCurrentTrackEntry();
    static Event* getCurrentEvent();

    static uint32_t s_listenerID;
    static EventType s_currentType;
    static TrackEntry* s_currentEntry;
    static Event* s_currentEvent;
};

#endif
