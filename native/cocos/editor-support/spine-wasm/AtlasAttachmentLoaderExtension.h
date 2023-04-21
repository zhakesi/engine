#include "spine/spine.h"
#include "MeshDataDef.h"

class AttachmentVertices {
public:
    AttachmentVertices(int verticesCount, uint16_t *triangles, int trianglesCount);
    virtual ~AttachmentVertices();
    //cc::middleware::Texture2D *_texture = nullptr;
    Triangles *_triangles = nullptr;
};

class AtlasAttachmentLoaderExtension : public spine::AtlasAttachmentLoader {
public:
    AtlasAttachmentLoaderExtension(spine::Atlas *atlas);
    virtual ~AtlasAttachmentLoaderExtension();
    virtual void configureAttachment(spine::Attachment *attachment);
};