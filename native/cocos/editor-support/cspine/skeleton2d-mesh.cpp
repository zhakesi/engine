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
    vCount = vNum;
    iCount = iNum;
    byteStride = stride;
    auto floatNum = vCount * byteStride / sizeof(float);
    vertices.resize(floatNum);
    indices.resize(iCount);
}

}
}
