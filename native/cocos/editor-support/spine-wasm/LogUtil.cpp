#include <emscripten/emscripten.h>
#include "LogUtil.h"
#include <stdint.h>
#include "ImportDef.h"



static char* sBuffer = nullptr;
const int BUFFER_SIZE = 1024;

void LogUtil::Initialize() {
    sBuffer = new char[BUFFER_SIZE];
}

void LogUtil::PrintToJs(std::string &message) {
    int length = message.length();
    if (length >= BUFFER_SIZE) length = BUFFER_SIZE -1;
    memcpy(sBuffer, message.c_str(), length);
    sBuffer[length] = 0;
    consoleInfo(sBuffer, length);
}

void LogUtil::PrintToJs(const char* message) {
    std::string strMessage(message);
    int length = strMessage.length();
    if (length >= BUFFER_SIZE) length = BUFFER_SIZE - 1;
    memcpy(sBuffer, strMessage.c_str(), length);
    sBuffer[length] = 0;
    consoleInfo(sBuffer, length);
}

void LogUtil::PrintToJs(char* str, int length)
{
    if (length >= BUFFER_SIZE) length = BUFFER_SIZE - 1;
    memcpy(sBuffer, str, length);
    sBuffer[length] = 0;
    consoleInfo(sBuffer, length);
}

void LogUtil::PrintIntValue(int value, const char* message)
{
    std::string strInt = std::to_string(value);
    std::string finalStr = std::string(message) + strInt;
    LogUtil::PrintToJs(finalStr);
}

void LogUtil::ReleaseBuffer() {
    delete[] sBuffer;
}

