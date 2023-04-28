#include "wasmSpineExtension.h"
#include "share-mem.h"
#include "ImportDef.h"
#include "LogUtil.h"
using namespace spine;


WasmSpineExtension::WasmSpineExtension() : DefaultSpineExtension() {
}

WasmSpineExtension::~WasmSpineExtension() {
}

char *WasmSpineExtension::_readFile(const String &path, int *length)
{
    size_t pathSize = path.length();
	uint8_t* uint8Ptr = getStoreMemory();
    char* shareBuffer = (char*)uint8Ptr;
    memcpy(shareBuffer, path.buffer(), pathSize);
    uint32_t resultSize = jsReadFile(shareBuffer, pathSize);
    *length = (int)resultSize;
    uint8_t *data = new uint8_t[resultSize];
    memcpy(data, shareBuffer, resultSize);
	return (char*)data;
}

void *WasmSpineExtension::_alloc(size_t size, const char *file, int line)
{
	SP_UNUSED(file);
	SP_UNUSED(line);

	if (size == 0)
		return 0;
	void *ptr = new uint8_t[size];
	return (void*)ptr;
}

void *WasmSpineExtension::_calloc(size_t size, const char *file, int line)
{
	SP_UNUSED(file);
	SP_UNUSED(line);

	if (size == 0)
		return 0;
    uint8_t *ptr = new uint8_t[size];
	if (ptr) memset(ptr, 0, size);
	return (void*)ptr;
}

void *WasmSpineExtension::_realloc(void *ptr, size_t size, const char *file, int line)
{
	SP_UNUSED(file);
	SP_UNUSED(line);

	if (size == 0)
		return 0;
    uint8_t* mem = new uint8_t[size];
    memcpy(mem, ptr, size);
    delete[] ptr;
    ptr = mem;
	return mem;
}

void WasmSpineExtension::_free(void *mem, const char *file, int line)
{
	SP_UNUSED(file);
	SP_UNUSED(line);

	delete[] (char*)mem;
}

SpineExtension *spine::getDefaultExtension() {
    return new WasmSpineExtension();
}

void WasmSpineExtension::RTTI_INIT()
{
	RTTI_NOPARENT_HACK(Attachment)
	RTTI_NOPARENT_HACK(AttachmentLoader)
	RTTI_NOPARENT_HACK(Timeline)
	RTTI_NOPARENT_HACK(Updatable)

	RTTI_HACK(AtlasAttachmentLoader, AttachmentLoader)
	RTTI_HACK(AttachmentTimeline, Timeline)
	RTTI_HACK(Bone, Updatable)
	RTTI_HACK(DrawOrderTimeline, Timeline)
	RTTI_HACK(EventTimeline, Timeline)
	RTTI_HACK(CurveTimeline, Timeline)
	RTTI_HACK(IkConstraint, Updatable)
	RTTI_HACK(PathConstraint, Updatable)
	RTTI_HACK(PointAttachment, Attachment)
	RTTI_HACK(RegionAttachment, Attachment)
	RTTI_HACK(TransformConstraint, Updatable)
	RTTI_HACK(VertexAttachment, Attachment)

	RTTI_HACK(BoundingBoxAttachment, VertexAttachment)
	RTTI_HACK(ClippingAttachment, VertexAttachment)
	RTTI_HACK(MeshAttachment, VertexAttachment)
	RTTI_HACK(PathAttachment, VertexAttachment)

	RTTI_HACK(ColorTimeline, CurveTimeline)
	RTTI_HACK(DeformTimeline, CurveTimeline)
	RTTI_HACK(IkConstraintTimeline, CurveTimeline);
	RTTI_HACK(PathConstraintMixTimeline, CurveTimeline)
	RTTI_HACK(PathConstraintPositionTimeline, CurveTimeline)
	RTTI_HACK(RotateTimeline, CurveTimeline)
	RTTI_HACK(TranslateTimeline, CurveTimeline)
	RTTI_HACK(TwoColorTimeline, CurveTimeline)
	RTTI_HACK(TransformConstraintTimeline, CurveTimeline)

	RTTI_HACK(ScaleTimeline, TranslateTimeline)
	RTTI_HACK(ShearTimeline, TranslateTimeline)

	RTTI_HACK(PathConstraintSpacingTimeline, PathConstraintPositionTimeline)

}


