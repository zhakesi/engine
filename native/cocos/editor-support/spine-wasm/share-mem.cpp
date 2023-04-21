#include "share-mem.h"

const uint32_t STORE_MEM_SIZE = 16 * 1024 * 1024; 
static WasmShareMem* storeMem = nullptr;

WasmShareMem::WasmShareMem(uint32_t size) {
    uint8Ptr = new uint8_t[size];
    length = size;
    used = 0;
}

WasmShareMem::~WasmShareMem() {
    delete[] uint8Ptr;
    length = 0;
    used = 0;
}

WasmShareMem* getStoreMem() {
    if (!storeMem) storeMem = new WasmShareMem(STORE_MEM_SIZE);
    return storeMem;
}