#ifndef __SPINE_WASM_SHARE_MEM_H__
#define __SPINE_WASM_SHARE_MEM_H__
#include <stdint.h>

uint8_t* getStoreMemory();
void     freeStoreMemory();
uint32_t storeMemorySize();

#endif