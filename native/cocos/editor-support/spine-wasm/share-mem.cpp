#include "share-mem.h"

const uint32_t MEMORY_SIZE = 16 * 1024 * 1024; 
static uint8_t* uint8Ptr = nullptr;

uint8_t* getStoreMemory() {
    if (uint8Ptr) return uint8Ptr;
    
    uint32_t* uint32Ptr = new uint32_t[MEMORY_SIZE / 4];
    uint8Ptr = (uint8_t*)uint32Ptr;
    return uint8Ptr;
}

void freeStoreMemory() {
    if (uint8Ptr) {
        delete[] uint8Ptr;
        uint8Ptr = nullptr;
    }
}

uint32_t storeMemorySize() {
    return MEMORY_SIZE;
}