/*
 Copyright (c) 2019-2020 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
/**
 * @packageDocumentation
 * @hidden
 */
import { Node } from '../../core/scene-graph';
import { Renderable2D } from '../framework'
import { Batcher2D } from './batcher-2d'

let FlagOfset = 0;
const DONOTHING = 1 << FlagOfset++; // 0
const BREAK_FLOW = 1 << FlagOfset++; // 1 << 1
const LOCAL_TRANSFORM = 1 << FlagOfset++; //1 << 2
const WORLD_TRANSFORM = 1 << FlagOfset++; // 1 << 3
const TRANSFORM = LOCAL_TRANSFORM | WORLD_TRANSFORM;
const UPDATE_RENDER_DATA = 1 << FlagOfset++; // 1 << 4
const OPACITY = 1 << FlagOfset++; // 1 << 5
const COLOR = 1 << FlagOfset++; // 1 << 6
const OPACITY_COLOR = OPACITY | COLOR;
const RENDER = 1 << FlagOfset++; // 1 << 7
const CHILDREN = 1 << FlagOfset++; // 1 << 8
const POST_RENDER = 1 << FlagOfset++; // 1 << 9
const FINAL = 1 << FlagOfset++; // 1 << 10

export class RenderFlow2D {
    public _func : any = null;
    public _next : RenderFlow2D | null = null;

    public static init : any = null;
    
    public static bather : Batcher2D | null;

    public static flows : RenderFlow2D[];

    constructor () {
        this._func = init;
        this._next = null;
    }

    public static visitRootNode (rootNode : Node) {
        rootNode.flowMask = CHILDREN;
        if (rootNode.flowMask) {
            RenderFlow2D.flows[rootNode.flowMask]._func(rootNode);
        }
    }

    public _doNothing () {
        //console.log('_doNothing');
    };

    public _localTransform (node : Node) {
        node.flowMask &= ~LOCAL_TRANSFORM;
        //console.log('_localTransform');
        this._next!._func(node);
    };
    
    public _worldTransform (node : Node) {
        node.flowMask &= ~WORLD_TRANSFORM;
        //console.log('_worldTransform');
        node.updateWorldTransform();
        this._next!._func(node);
    };
    
    public _opacity (node : Node) {
        //console.log('_opacity');
        let ppOpacity = node.parent ? node.parent._uiProps.opacity : 1.0;
        const localAlpha = node._uiProps.localOpacity;
        node._uiProps.opacity = ppOpacity * localAlpha;

        //node.flowMask &= ~OPACITY;
        this._next!._func(node);
    };
    
    public _color (node : Node) {
        //console.log('_color');
        const render = node._uiProps.uiComp;
        render!.updateColor();
        node.flowMask &= ~COLOR;
        this._next!._func(node);
    };
    
    public _updateRenderData (node : Node) {
        //if (node._uiProps.uiTransformComp && node._uiProps.uiComp) {
        const render = node._uiProps.uiComp;
        if (render && render!._renderFlag) {
            render!._checkAndUpdateRenderData();
        }
        // render!.updateAssembler(RenderFlow2D.bather!);
        //node.flowMask &= ~UPDATE_RENDER_DATA;
        this._next!._func(node);
    };
    
    public _render (node : Node) {
        //console.log('_render');
        const render = node._uiProps.uiComp;
        if (render && render!._renderFlag) {
            render!._render(RenderFlow2D.bather!);
        }
        
        this._next!._func(node);
    };

    public _children (node : Node) {
        //console.log('_children');
        let children = node.children;
        for (let i = 0, l = children.length; i < l; i++) {
            let c = children[i];
            flows[c.flowMask]._func(c);
        }
        this._next!._func(node);
    };
    
    public _postRender (node : Node) {
        //console.log('_postRender');
        this._next!._func(node);
    };
}

let flows : RenderFlow2D[] = [];





const EMPTY_FLOW = new RenderFlow2D();
EMPTY_FLOW._func = EMPTY_FLOW._doNothing;
EMPTY_FLOW._next = EMPTY_FLOW;

function createFlow (flag : number, next : RenderFlow2D | null) {
    let flow = new RenderFlow2D();
    flow._next = next;
    if (!flow._next) flow._next = EMPTY_FLOW;
    
    switch (flag) {
        case DONOTHING: 
            flow._func = RenderFlow2D.prototype._doNothing;
            break;
        case BREAK_FLOW:
            flow._func = RenderFlow2D.prototype._doNothing;
            break;
        case LOCAL_TRANSFORM: 
            flow._func = RenderFlow2D.prototype._localTransform;
            break;
        case WORLD_TRANSFORM: 
            flow._func = RenderFlow2D.prototype._worldTransform;
            break;
        case OPACITY:
            flow._func = RenderFlow2D.prototype._opacity;
            break;
        case COLOR:
            flow._func = RenderFlow2D.prototype._color;
            break;
        case UPDATE_RENDER_DATA:
            flow._func = RenderFlow2D.prototype._updateRenderData;
            break;
        case RENDER: 
            flow._func = RenderFlow2D.prototype._render;
            break;
        case CHILDREN: 
            flow._func = RenderFlow2D.prototype._children;
            break;
        case POST_RENDER: 
            flow._func = RenderFlow2D.prototype._postRender;
            break;
    }
        return flow;
    }

function getFlow (flag) {
    let flow : RenderFlow2D | null = null;
    let tFlag = FINAL;
    while (tFlag > 0) {
        if (tFlag & flag)
            flow = createFlow(tFlag, flow);
        tFlag = tFlag >> 1;
    }
    return flow;
}

function init (node) {
    let flag = node.flowMask;
    let flow = getFlow(flag);
    flows[flag] = flow!;
    flow!._func(node);
}

RenderFlow2D.flows = flows;

RenderFlow2D.init = function (bather : Batcher2D) {
    RenderFlow2D.bather = bather;
    flows[0] = EMPTY_FLOW;
    for (let i = 1; i < FINAL; i++) {
        flows[i] = new RenderFlow2D();
    }
};