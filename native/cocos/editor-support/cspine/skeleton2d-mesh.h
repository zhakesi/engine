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
    inline std::vector<float>& getVertices() { return _vertices; }
    inline std::vector<uint16_t>& getIndices() { return _indices; }
    inline int getByteStride() { return _byteStride;}
    inline int getVCount() { return _vCount;}
    inline int getICount() { return _iCount;}
private:
    std::vector<float> _vertices;
    std::vector<uint16_t> _indices;
    int    _byteStride;
    int    _vCount;
    int    _iCount;
};

}
}
