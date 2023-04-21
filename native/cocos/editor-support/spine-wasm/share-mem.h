#ifndef __SPINE_WASM_SHARE_MEM_H__
#define __SPINE_WASM_SHARE_MEM_H__
#include <stdint.h>
class WasmShareMem {
public:
    WasmShareMem(uint32_t size);
    ~WasmShareMem();
public:
    uint8_t*    uint8Ptr;
    uint32_t    used;
    uint32_t    length; 
};

WasmShareMem* getStoreMem();

#endif