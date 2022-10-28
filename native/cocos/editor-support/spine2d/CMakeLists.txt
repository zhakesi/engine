cmake_minimum_required(VERSION 2.8)

set(APP_NAME "spine2d" CACHE STRING "Project Name")
project(${APP_NAME}_wasm)

include_directories(../)
file(GLOB SPINE_CORE_SRC
    ../spine/*.cpp
)

add_executable(${APP_NAME} ${SPINE_CORE_SRC})

