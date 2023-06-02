#ifndef __WASM_DATA_CONVERT_H__
#define __WASM_DATA_CONVERT_H__

#include <string>
#include "spine/spine.h"
class DataConvert {
public:
    static std::string& Convert2StdString(uint32_t start, uint32_t length);
    static spine::String& Convert2SpineString(uint32_t start, uint32_t length);
};

#endif