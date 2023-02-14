#include "skeleton2d-mesh.h"
#include "core/platform/Debug.h"
#include "base/memory/Memory.h"

namespace cc {
namespace cspine {
Skeleton2DMesh::Skeleton2DMesh() {

}

Skeleton2DMesh::~Skeleton2DMesh() {
}

Skeleton2DMesh::Skeleton2DMesh(int vNum, int iNum, int stride) {
    _vCount = vNum;
    _iCount = iNum;
    _byteStride = stride;
    auto floatNum = _vCount * _byteStride / sizeof(float);
    _vertices.resize(floatNum);
    _indices.resize(_iCount);
}

}
}
