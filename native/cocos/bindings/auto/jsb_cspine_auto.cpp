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



se::Class* __jsb_cc_cspine_Skeleton2D_class = nullptr;
se::Object* __jsb_cc_cspine_Skeleton2D_proto = nullptr;
SE_DECLARE_FINALIZE_FUNC(js_delete_cc_cspine_Skeleton2D) 

static bool js_cc_cspine_Skeleton2D_nativeFunctionTest(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    cc::cspine::Skeleton2D *arg1 = (cc::cspine::Skeleton2D *) NULL ;
    
    if(argc != 0) {
        SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
        return false;
    }
    arg1 = SE_THIS_OBJECT<cc::cspine::Skeleton2D>(s);
    if (nullptr == arg1) return true;
    (arg1)->nativeFunctionTest();
    
    
    return true;
}
SE_BIND_FUNC(js_cc_cspine_Skeleton2D_nativeFunctionTest) 

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

bool js_register_cc_cspine_Skeleton2D(se::Object* obj) {
    auto* cls = se::Class::create("Skeleton2D", obj, nullptr, _SE(js_new_cc_cspine_Skeleton2D)); 
    
    cls->defineStaticProperty("__isJSB", se::Value(true), se::PropertyAttribute::READ_ONLY | se::PropertyAttribute::DONT_ENUM | se::PropertyAttribute::DONT_DELETE);
    
    cls->defineFunction("nativeFunctionTest", _SE(js_cc_cspine_Skeleton2D_nativeFunctionTest)); 
    
    
    
    
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
