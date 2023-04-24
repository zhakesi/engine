#pragma once
#include "base/Macros.h"
#include "base/Ptr.h"
#include "base/TypeDef.h"
#include <vector>
#include "bindings/utils/BindingUtils.h"
#include "base/std/container/string.h"
#include "cocos/editor-support/spine/spine.h"
#include "spine-mesh-data.h"


namespace cc {
class RenderEntity;
class RenderDrawInfo;
class Material;
class Texture2D;
class UIMeshBuffer;
};

namespace cc {
namespace cocosspine {

class SpinePartialRendererUI {
public:
    SpinePartialRendererUI();
    ~SpinePartialRendererUI();
    void setRenderEntity(cc::RenderEntity* entity);
    void updateMeshData(std::vector<Skeleton2DMesh *> &meshes);
    cc::RenderDrawInfo *SpinePartialRendererUI::requestDrawInfo(int idx);

    inline Material *getMaterial() const { return _material; }
    inline void setMaterial(Material *material) {
        _material = material;
    }

    inline Texture2D *getTexture() const { return _texture; }
    inline void setTexture(Texture2D *texture) {
        _texture = texture;
    }

private:
    cc::RenderEntity *_entity = nullptr;
    cc::Material *_material = nullptr;
    cc::Texture2D *_texture = nullptr;
    std::vector<cc::RenderDrawInfo *> _drawInfoArray;

    std::vector<float> _vData;
    std::vector<uint16_t> _iData;
    cc::UIMeshBuffer *_uiMesh = nullptr;
}; // class SpinePartialRendererUI

} // namespace cocosspine
} // namespace cc
