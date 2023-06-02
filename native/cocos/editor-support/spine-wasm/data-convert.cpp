
#include "data-convert.h"

std::string& DataConvert::Convert2StdString(uint32_t start, uint32_t length)
{
    char* data = (char*)start;
    std::string strData(data, length);
    return strData;
}

spine::String& DataConvert::Convert2SpineString(uint32_t start, uint32_t length)
{
    char* data = (char*)start;
    spine::String strData(data, length);
    return strData;
}