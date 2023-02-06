// Define module
// target_namespace means the name exported to JS, could be same as which in other modules
%module(target_namespace="cspine") cspine

// Insert code at the beginning of generated header file (.h)
%insert(header_file) %{
#pragma once
#include "bindings/jswrapper/SeApi.h"
#include "bindings/manual/jsb_conversions.h"
#include "editor-support/cspine/skeleton2d-mesh.h"
#include "editor-support/cspine/skeleton2d.h"
%}

// Insert code at the beginning of generated source file (.cpp)
%{
#include "bindings/auto/jsb_cspine_auto.h"
%}

%import "base/Macros.h"
%import "base/RefCounted.h"
%import "base/TypeDef.h"
%import "base/Ptr.h"
%import "base/memory/Memory.h"
%import "base/RefCounted.h"


%attribute(cc::cspine::Skeleton2DMesh, std::vector<float>&, vertices, getVertices);
%attribute(cc::cspine::Skeleton2DMesh, std::vector<uint16_t>&, indices, getIndices);
%attribute(cc::cspine::Skeleton2DMesh, int, byteStride, getByteStride);    
%attribute(cc::cspine::Skeleton2DMesh, int, vCount, getVCount);
%attribute(cc::cspine::Skeleton2DMesh, int, iCount, getICount);

// ----- Include Section ------

%include "editor-support/cspine/skeleton2d-mesh.h"
%include "editor-support/cspine/skeleton2d.h"
