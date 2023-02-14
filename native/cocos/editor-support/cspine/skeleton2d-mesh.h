#pragma once
#include <stdint.h>
#include "bindings/utils/BindingUtils.h"
namespace cc {
namespace cspine {

class Skeleton2DMesh {
public:
    Skeleton2DMesh();
    Skeleton2DMesh(int vNum, int iNum, int stride);
    ~Skeleton2DMesh();

public:
    float *vertices;
    uint16_t *indices;
    int    byteStride;
    int    vCount;
    int    iCount;
};

}
}
