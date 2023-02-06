// clang-format off

/* ----------------------------------------------------------------------------
 * This file was automatically generated by SWIG (https://www.swig.org).
 * Version 4.1.0
 *
 * Do not make changes to this file unless you know what you are doing - modify
 * the SWIG interface file instead.
 * ----------------------------------------------------------------------------- */

/****************************************************************************
 Copyright (c) 2022-2023 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

#if defined(__clang__)
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-variable"
#elif defined(__GNUC__) || defined(__GNUG__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-variable"
#elif defined(_MSC_VER)
#pragma warning(push)
#pragma warning(disable : 4101)
#endif


#define SWIG_STD_MOVE(OBJ) std::move(OBJ)


#include <stdio.h>


#include "bindings/jswrapper/SeApi.h"
#include "bindings/manual/jsb_conversions.h"
#include "bindings/manual/jsb_global.h"


#include "bindings/auto/jsb_cspine_auto.h"


#define cc_cspine_Skeleton2DMesh_vertices_get(self_) self_->getVertices()
  

#define cc_cspine_Skeleton2DMesh_indices_get(self_) self_->getIndices()
  

#define cc_cspine_Skeleton2DMesh_byteStride_get(self_) self_->getByteStride()
  

#define cc_cspine_Skeleton2DMesh_vCount_get(self_) self_->getVCount()
  

#define cc_cspine_Skeleton2DMesh_iCount_get(self_) self_->getICount()
  


se::Class* __jsb_cc_cspine_Skeleton2DMesh_class = nullptr;
se::Object* __jsb_cc_cspine_Skeleton2DMesh_proto = nullptr;
SE_DECLARE_FINALIZE_FUNC(js_delete_cc_cspine_Skeleton2DMesh) 

static bool js_new_cc_cspine_Skeleton2DMesh__SWIG_0(se::State& s) // NOLINT(readability-identifier-naming)
{
    const auto& args = s.args();
    CC_UNUSED bool ok = true;
    cc::cspine::Skeleton2DMesh *result;
    result = (cc::cspine::Skeleton2DMesh *)new cc::cspine::Skeleton2DMesh();
    
    
    auto *ptr = JSB_MAKE_PRIVATE_OBJECT_WITH_INSTANCE(result);
    s.thisObject()->setPrivateObject(ptr);
    return true;
}


static bool js_new_cc_cspine_Skeleton2DMesh__SWIG_1(se::State& s) // NOLINT(readability-identifier-naming)
{
    const auto& args = s.args();
    CC_UNUSED bool ok = true;
    int arg1 ;
    int arg2 ;
    int arg3 ;
    cc::cspine::Skeleton2DMesh *result;
    
    ok &= sevalue_to_native(args[0], &arg1, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments"); 
    
    ok &= sevalue_to_native(args[1], &arg2, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments"); 
    
    ok &= sevalue_to_native(args[2], &arg3, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments"); 
    result = (cc::cspine::Skeleton2DMesh *)new cc::cspine::Skeleton2DMesh(arg1,arg2,arg3);
    
    
    auto *ptr = JSB_MAKE_PRIVATE_OBJECT_WITH_INSTANCE(result);
    s.thisObject()->setPrivateObject(ptr);
    return true;
}


static bool js_new_Skeleton2DMesh(se::State& s) // NOLINT(readability-identifier-naming)
{
    size_t argc = s.args().size();
    bool ret = false;
    
    if(argc == 0) {
        ret = js_new_cc_cspine_Skeleton2DMesh__SWIG_0(s);
        if (ret) {
            return ret; 
        } /* reset exception and return */
    }
    
    if(argc == 3) {
        ret = js_new_cc_cspine_Skeleton2DMesh__SWIG_1(s);
        if (ret) {
            return ret; 
        } /* reset exception and return */
    }
    
    SE_REPORT_ERROR("Illegal arguments for construction of Skeleton2DMesh");
    return false;
}
SE_BIND_CTOR(js_new_Skeleton2DMesh, __jsb_cc_cspine_Skeleton2DMesh_class, js_delete_cc_cspine_Skeleton2DMesh)

static bool js_delete_cc_cspine_Skeleton2DMesh(se::State& s)
{
    return true;
}
SE_BIND_FINALIZE_FUNC(js_delete_cc_cspine_Skeleton2DMesh) 

static bool js_cc_cspine_Skeleton2DMesh_vertices_get(se::State& s)
{
    CC_UNUSED bool ok = true;
    cc::cspine::Skeleton2DMesh *arg1 = (cc::cspine::Skeleton2DMesh *) NULL ;
    std::vector< float > *result = 0 ;
    
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2DMesh>(s);
    if (nullptr == arg1) return true;
    result = (std::vector< float > *) &cc_cspine_Skeleton2DMesh_vertices_get(arg1);
    
    ok &= nativevalue_to_se(*result, s.rval(), s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    SE_HOLD_RETURN_VALUE(*result, s.thisObject(), s.rval()); 
    
    
    return true;
}
SE_BIND_PROP_GET(js_cc_cspine_Skeleton2DMesh_vertices_get) 

static bool js_cc_cspine_Skeleton2DMesh_indices_get(se::State& s)
{
    CC_UNUSED bool ok = true;
    cc::cspine::Skeleton2DMesh *arg1 = (cc::cspine::Skeleton2DMesh *) NULL ;
    std::vector< uint16_t > *result = 0 ;
    
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2DMesh>(s);
    if (nullptr == arg1) return true;
    result = (std::vector< uint16_t > *) &cc_cspine_Skeleton2DMesh_indices_get(arg1);
    
    ok &= nativevalue_to_se(*result, s.rval(), s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    SE_HOLD_RETURN_VALUE(*result, s.thisObject(), s.rval()); 
    
    
    return true;
}
SE_BIND_PROP_GET(js_cc_cspine_Skeleton2DMesh_indices_get) 

static bool js_cc_cspine_Skeleton2DMesh_byteStride_get(se::State& s)
{
    CC_UNUSED bool ok = true;
    cc::cspine::Skeleton2DMesh *arg1 = (cc::cspine::Skeleton2DMesh *) NULL ;
    int result;
    
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2DMesh>(s);
    if (nullptr == arg1) return true;
    result = (int)cc_cspine_Skeleton2DMesh_byteStride_get(arg1);
    
    ok &= nativevalue_to_se(result, s.rval(), s.thisObject()); 
    
    
    return true;
}
SE_BIND_PROP_GET(js_cc_cspine_Skeleton2DMesh_byteStride_get) 

static bool js_cc_cspine_Skeleton2DMesh_vCount_get(se::State& s)
{
    CC_UNUSED bool ok = true;
    cc::cspine::Skeleton2DMesh *arg1 = (cc::cspine::Skeleton2DMesh *) NULL ;
    int result;
    
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2DMesh>(s);
    if (nullptr == arg1) return true;
    result = (int)cc_cspine_Skeleton2DMesh_vCount_get(arg1);
    
    ok &= nativevalue_to_se(result, s.rval(), s.thisObject()); 
    
    
    return true;
}
SE_BIND_PROP_GET(js_cc_cspine_Skeleton2DMesh_vCount_get) 

static bool js_cc_cspine_Skeleton2DMesh_iCount_get(se::State& s)
{
    CC_UNUSED bool ok = true;
    cc::cspine::Skeleton2DMesh *arg1 = (cc::cspine::Skeleton2DMesh *) NULL ;
    int result;
    
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2DMesh>(s);
    if (nullptr == arg1) return true;
    result = (int)cc_cspine_Skeleton2DMesh_iCount_get(arg1);
    
    ok &= nativevalue_to_se(result, s.rval(), s.thisObject()); 
    
    
    return true;
}
SE_BIND_PROP_GET(js_cc_cspine_Skeleton2DMesh_iCount_get) 

bool js_register_cc_cspine_Skeleton2DMesh(se::Object* obj) {
    auto* cls = se::Class::create("Skeleton2DMesh", obj, nullptr, _SE(js_new_Skeleton2DMesh)); 
    
    cls->defineStaticProperty("__isJSB", se::Value(true), se::PropertyAttribute::READ_ONLY | se::PropertyAttribute::DONT_ENUM | se::PropertyAttribute::DONT_DELETE);
    cls->defineProperty("vertices", _SE(js_cc_cspine_Skeleton2DMesh_vertices_get), nullptr); 
    cls->defineProperty("indices", _SE(js_cc_cspine_Skeleton2DMesh_indices_get), nullptr); 
    cls->defineProperty("byteStride", _SE(js_cc_cspine_Skeleton2DMesh_byteStride_get), nullptr); 
    cls->defineProperty("vCount", _SE(js_cc_cspine_Skeleton2DMesh_vCount_get), nullptr); 
    cls->defineProperty("iCount", _SE(js_cc_cspine_Skeleton2DMesh_iCount_get), nullptr); 
    
    
    
    
    
    cls->defineFinalizeFunction(_SE(js_delete_cc_cspine_Skeleton2DMesh));
    
    
    cls->install();
    JSBClassType::registerClass<cc::cspine::Skeleton2DMesh>(cls);
    
    __jsb_cc_cspine_Skeleton2DMesh_proto = cls->getProto();
    __jsb_cc_cspine_Skeleton2DMesh_class = cls;
    se::ScriptEngine::getInstance()->clearException();
    return true;
}


se::Class* __jsb_cc_cspine_Skeleton2D_class = nullptr;
se::Object* __jsb_cc_cspine_Skeleton2D_proto = nullptr;
SE_DECLARE_FINALIZE_FUNC(js_delete_cc_cspine_Skeleton2D) 

static bool js_new_cc_cspine_Skeleton2D(se::State& s) // NOLINT(readability-identifier-naming)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    
    cc::cspine::Skeleton2D *result;
    result = (cc::cspine::Skeleton2D *)new cc::cspine::Skeleton2D();
    
    
    auto *ptr = JSB_MAKE_PRIVATE_OBJECT_WITH_INSTANCE(result);
    s.thisObject()->setPrivateObject(ptr);
    return true;
}
SE_BIND_CTOR(js_new_cc_cspine_Skeleton2D, __jsb_cc_cspine_Skeleton2D_class, js_delete_cc_cspine_Skeleton2D)

static bool js_delete_cc_cspine_Skeleton2D(se::State& s)
{
    return true;
}
SE_BIND_FINALIZE_FUNC(js_delete_cc_cspine_Skeleton2D) 

static bool js_cc_cspine_Skeleton2D_initSkeletonData(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    cc::cspine::Skeleton2D *arg1 = (cc::cspine::Skeleton2D *) NULL ;
    ccstd::string *arg2 = 0 ;
    ccstd::string *arg3 = 0 ;
    ccstd::string temp2 ;
    ccstd::string temp3 ;
    
    if(argc != 2) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 2);
        return false;
    }
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2D>(s);
    if (nullptr == arg1) return true;
    
    ok &= sevalue_to_native(args[0], &temp2, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    arg2 = &temp2;
    
    
    ok &= sevalue_to_native(args[1], &temp3, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    arg3 = &temp3;
    
    (arg1)->initSkeletonData(*arg2,*arg3);
    
    
    return true;
}
SE_BIND_FUNC(js_cc_cspine_Skeleton2D_initSkeletonData) 

static bool js_cc_cspine_Skeleton2D_initSkeletonDataBinary(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    cc::cspine::Skeleton2D *arg1 = (cc::cspine::Skeleton2D *) NULL ;
    ccstd::string *arg2 = 0 ;
    ccstd::string *arg3 = 0 ;
    ccstd::string temp2 ;
    ccstd::string temp3 ;
    
    if(argc != 2) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 2);
        return false;
    }
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2D>(s);
    if (nullptr == arg1) return true;
    
    ok &= sevalue_to_native(args[0], &temp2, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    arg2 = &temp2;
    
    
    ok &= sevalue_to_native(args[1], &temp3, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    arg3 = &temp3;
    
    (arg1)->initSkeletonDataBinary(*arg2,*arg3);
    
    
    return true;
}
SE_BIND_FUNC(js_cc_cspine_Skeleton2D_initSkeletonDataBinary) 

static bool js_cc_cspine_Skeleton2D_setSkin(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    cc::cspine::Skeleton2D *arg1 = (cc::cspine::Skeleton2D *) NULL ;
    ccstd::string *arg2 = 0 ;
    ccstd::string temp2 ;
    
    if(argc != 1) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
        return false;
    }
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2D>(s);
    if (nullptr == arg1) return true;
    
    ok &= sevalue_to_native(args[0], &temp2, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    arg2 = &temp2;
    
    (arg1)->setSkin(*arg2);
    
    
    return true;
}
SE_BIND_FUNC(js_cc_cspine_Skeleton2D_setSkin) 

static bool js_cc_cspine_Skeleton2D_setAnimation(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    cc::cspine::Skeleton2D *arg1 = (cc::cspine::Skeleton2D *) NULL ;
    ccstd::string *arg2 = 0 ;
    ccstd::string temp2 ;
    
    if(argc != 1) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
        return false;
    }
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2D>(s);
    if (nullptr == arg1) return true;
    
    ok &= sevalue_to_native(args[0], &temp2, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    arg2 = &temp2;
    
    (arg1)->setAnimation(*arg2);
    
    
    return true;
}
SE_BIND_FUNC(js_cc_cspine_Skeleton2D_setAnimation) 

static bool js_cc_cspine_Skeleton2D_updateAnimation(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    cc::cspine::Skeleton2D *arg1 = (cc::cspine::Skeleton2D *) NULL ;
    float arg2 ;
    
    if(argc != 1) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
        return false;
    }
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2D>(s);
    if (nullptr == arg1) return true;
    
    ok &= sevalue_to_native(args[0], &arg2, s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments"); 
    (arg1)->updateAnimation(arg2);
    
    
    return true;
}
SE_BIND_FUNC(js_cc_cspine_Skeleton2D_updateAnimation) 

static bool js_cc_cspine_Skeleton2D_updateRenderData(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    cc::cspine::Skeleton2D *arg1 = (cc::cspine::Skeleton2D *) NULL ;
    std::vector< cc::cspine::Skeleton2DMesh * > *result = 0 ;
    
    if(argc != 0) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
        return false;
    }
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2D>(s);
    if (nullptr == arg1) return true;
    result = (std::vector< cc::cspine::Skeleton2DMesh * > *) &(arg1)->updateRenderData();
    
    ok &= nativevalue_to_se(*result, s.rval(), s.thisObject());
    SE_PRECONDITION2(ok, false, "Error processing arguments");
    SE_HOLD_RETURN_VALUE(*result, s.thisObject(), s.rval()); 
    
    
    return true;
}
SE_BIND_FUNC(js_cc_cspine_Skeleton2D_updateRenderData) 

bool js_register_cc_cspine_Skeleton2D(se::Object* obj) {
    auto* cls = se::Class::create("Skeleton2D", obj, nullptr, _SE(js_new_cc_cspine_Skeleton2D)); 
    
    cls->defineStaticProperty("__isJSB", se::Value(true), se::PropertyAttribute::READ_ONLY | se::PropertyAttribute::DONT_ENUM | se::PropertyAttribute::DONT_DELETE);
    
    cls->defineFunction("initSkeletonData", _SE(js_cc_cspine_Skeleton2D_initSkeletonData)); 
    cls->defineFunction("initSkeletonDataBinary", _SE(js_cc_cspine_Skeleton2D_initSkeletonDataBinary)); 
    cls->defineFunction("setSkin", _SE(js_cc_cspine_Skeleton2D_setSkin)); 
    cls->defineFunction("setAnimation", _SE(js_cc_cspine_Skeleton2D_setAnimation)); 
    cls->defineFunction("updateAnimation", _SE(js_cc_cspine_Skeleton2D_updateAnimation)); 
    cls->defineFunction("updateRenderData", _SE(js_cc_cspine_Skeleton2D_updateRenderData)); 
    
    
    
    
    cls->defineFinalizeFunction(_SE(js_delete_cc_cspine_Skeleton2D));
    
    
    cls->install();
    JSBClassType::registerClass<cc::cspine::Skeleton2D>(cls);
    
    __jsb_cc_cspine_Skeleton2D_proto = cls->getProto();
    __jsb_cc_cspine_Skeleton2D_class = cls;
    se::ScriptEngine::getInstance()->clearException();
    return true;
}




bool register_all_cspine(se::Object* obj) {
    // Get the ns
    se::Value nsVal;
    if (!obj->getProperty("cspine", &nsVal, true))
    {
        se::HandleObject jsobj(se::Object::createPlainObject());
        nsVal.setObject(jsobj);
        obj->setProperty("cspine", nsVal);
    }
    se::Object* ns = nsVal.toObject();
    /* Register classes */
    js_register_cc_cspine_Skeleton2DMesh(ns); 
    js_register_cc_cspine_Skeleton2D(ns); 
    
    /* Register global variables & global functions */
    
    
    
    return true;
}


#if defined(__clang__)
#pragma clang diagnostic pop
#elif defined(__GNUC__) || defined(__GNUG__)
#pragma GCC diagnostic pop
#elif defined(_MSC_VER)
#pragma warning(pop)
#endif
// clang-format on
