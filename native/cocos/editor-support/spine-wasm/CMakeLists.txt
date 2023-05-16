cmake_minimum_required(VERSION 3.0)

set(APP_NAME "spine" CACHE STRING "Project Name")
project(${APP_NAME}_wasm)

#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11  -Wextra -Wno-nonportable-include-path -fno-exceptions -v")
#set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -Wall -g3 -D_DEBUG=1 -Wno-unused -O0 -std=c++11")
#set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -w -DNDEBUG=1 -O3 -std=c++11")
#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} )

include_directories(../)
file(GLOB SPINE_CORE_SRC "../spine/*.cpp")
file(GLOB COCOS_ADAPTER_SRC "./*.cpp")

add_executable(${APP_NAME} ${SPINE_CORE_SRC} ${COCOS_ADAPTER_SRC} )
#add_executable(${APP_NAME} ${COCOS_ADAPTER_SRC})

# TOTAL_MEMORY=256M
set(EMS_LINK_FLAGS "-s ERROR_ON_UNDEFINED_SYMBOLS=0 -flto --no-entry --bind -s TOTAL_MEMORY=268435456 -s USE_ES6_IMPORT_META=0 -s EXPORT_ES6=1 -s MODULARIZE=1 -s EXPORT_NAME='spineWasm' -s ENVIRONMENT=web -s WASM=1 -s NO_EXIT_RUNTIME=1 -s LLD_REPORT_UNDEFINED")

set_target_properties(${APP_NAME} PROPERTIES CXX_STANDARD 11 LINK_FLAGS ${EMS_LINK_FLAGS})