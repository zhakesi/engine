#ifndef __LOG_UTIL_H__
#define __LOG_UTIL_H__
#include <string>
class LogUtil {
public:
    static void Initialize();
    static void PrintToJs(std::string &message);
    static void PrintToJs(const char* message);
    static void PrintToJs(char* str, int length);
    static void PrintIntValue(int value, const char* message);
    static void ReleaseBuffer();
};
#endif