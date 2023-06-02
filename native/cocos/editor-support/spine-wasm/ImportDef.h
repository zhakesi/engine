#ifndef __WASM_IMPORT_DEF_H__
#define __WASM_IMPORT_DEF_H__

extern "C" {
extern void consoleInfo(char* sBuffer, uint32_t length);
extern uint32_t jsReadFile(char* fileName, uint32_t length);
}

#endif