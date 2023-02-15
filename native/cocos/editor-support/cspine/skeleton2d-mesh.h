#pragma once
#include <vector>
#include <stdint.h>
#include "bindings/utils/BindingUtils.h"
namespace cc {
namespace cspine {

class Skeleton2DMesh {
public:
    Skeleton2DMesh();
    Skeleton2DMesh(int vNum, int iNum, int stride);
    ~Skeleton2DMesh();
    inline std::vector<float>& getVertices() {return vertices;}
    inline std::vector<uint16_t>&getIndices() {return indices;}
    inline int getByteStride() {return byteStride;}
    inline int getVCount() {return vCount;}
    inline int getICount() {return iCount;}
public:
    std::vector<float> vertices;
    std::vector<uint16_t> indices;
    int    byteStride;
    int    vCount;
    int    iCount;
};

}
}
