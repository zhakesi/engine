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
import { Renderable2D } from '../framework';
import { Batcher2D } from './batcher-2d';

let FlagOfset = 0;
const FLOW_NOTHING = 1 << FlagOfset++;
const FLOW_UPDATE_RENDER_DATA = 1 << FlagOfset++;
const FLOW_OPACITY = 1 << FlagOfset++;
const FLOW_COLOR = 1 << FlagOfset++;
const FLOW_OPACITY_COLOR = FLOW_OPACITY | FLOW_COLOR;
const FLOW_RENDER = 1 << FlagOfset++;
const FLOW_CHILDREN = 1 << FlagOfset++;
const FLOW_POST_RENDER = 1 << FlagOfset++;
const FLOW_FINAL = 1 << FlagOfset++;
export class RenderFlow2D {
    public _func : any = null;
    public _next : RenderFlow2D | null = null;

    public static init : any = null;

    public static bather : Batcher2D | null;

    public static flows : RenderFlow2D[];

    public static NOTHING = FLOW_NOTHING;
    public static UPDATE_RENDER_DATA = FLOW_UPDATE_RENDER_DATA;
    public static OPACITY = FLOW_OPACITY;
    public static COLOR = FLOW_COLOR;
    public static OPACITY_COLOR = FLOW_OPACITY_COLOR;
    public static RENDER = FLOW_RENDER;
    public static CHILDREN = FLOW_CHILDREN;
    public static POST_RENDER = FLOW_POST_RENDER;
    public static FINAL = FLOW_FINAL;

    constructor () {
        this._func = init;
        this._next = null;
    }

    public static visitRootNode (rootNode : Node) {
        rootNode.flowMask |= FLOW_CHILDREN;
        RenderFlow2D.flows[rootNode.flowMask]._func(rootNode);
    }

    public _doNothing () {
        //console.log('_doNothing');
    }

    public _opacity (node : Node) {
        //console.log('_opacity');
        let effectOpacity = 1.0;
        if (node.parent) {
            effectOpacity *= node.parent._uiProps.opacity;
            const render = node._uiProps.uiComp as Renderable2D;
            if (render) {
                effectOpacity *= (render.color.a / 255);
                render.markUpdateAlpha();
            }
        }
        node._uiProps.ApplyEffectOpacity(effectOpacity);
        node.flowMask &= ~FLOW_OPACITY;
        this._next!._func(node);
    }

    public _color (node : Node) {
        //console.log('_color');
        const render = node._uiProps.uiComp;
        render!._updateColor();
        node.flowMask &= ~FLOW_COLOR;
        this._next!._func(node);
    }

    public _updateRenderData (node : Node) {
        const render = node._uiProps.uiComp;
        render!._checkAndUpdateRenderData();
        node.flowMask &= ~FLOW_UPDATE_RENDER_DATA;
        this._next!._func(node);
    }

    public _render (node : Node) {
        //console.log('_render');
        const render = node._uiProps.uiComp;
        if (render && render._renderFlag) {
            render._render(RenderFlow2D.bather!);
        }
        this._next!._func(node);
    }

    public _children (node : Node) {
        //console.log('_children');
        const children = node.children;
        for (let i = 0, l = children.length; i < l; i++) {
            const c = children[i];
            flows[c.flowMask]._func(c);
        }
        this._next!._func(node);
    }

    public _postRender (node : Node) {
        //console.log('_postRender');
        const render = node._uiProps.uiComp;
        render!._postRender(RenderFlow2D.bather!);
        this._next!._func(node);
    }
}

let flows : RenderFlow2D[] = [];

const EMPTY_FLOW = new RenderFlow2D();
EMPTY_FLOW._func = EMPTY_FLOW._doNothing;
EMPTY_FLOW._next = EMPTY_FLOW;

function createFlow (flag : number, next : RenderFlow2D | null) {
    const flow = new RenderFlow2D();
    flow._next = next;
    if (!flow._next) flow._next = EMPTY_FLOW;

    switch (flag) {
    case FLOW_NOTHING:
        flow._func = RenderFlow2D.prototype._doNothing;
        break;
    case FLOW_OPACITY:
        flow._func = RenderFlow2D.prototype._opacity;
        break;
    case FLOW_COLOR:
        flow._func = RenderFlow2D.prototype._color;
        break;
    case FLOW_UPDATE_RENDER_DATA:
        flow._func = RenderFlow2D.prototype._updateRenderData;
        break;
    case FLOW_RENDER:
        flow._func = RenderFlow2D.prototype._render;
        break;
    case FLOW_CHILDREN:
        flow._func = RenderFlow2D.prototype._children;
        break;
    case FLOW_POST_RENDER:
        flow._func = RenderFlow2D.prototype._postRender;
        break;
    default:
        flow._func = RenderFlow2D.prototype._postRender;
        break;
    }
    return flow;
}

function getFlow (flag) {
    let flow : RenderFlow2D | null = null;
    let tFlag = FLOW_FINAL;
    while (tFlag > 0) {
        if (tFlag & flag) { flow = createFlow(tFlag, flow); }
        tFlag >>= 1;
    }
    return flow;
}

function init (node) {
    const flag = node.flowMask;
    const flow = getFlow(flag);
    flows[flag] = flow!;
    flow!._func(node);
}

RenderFlow2D.flows = flows;

// eslint-disable-next-line func-names
RenderFlow2D.init = function (bather : Batcher2D) {
    RenderFlow2D.bather = bather;
    flows[0] = EMPTY_FLOW;
    for (let i = 1; i < FLOW_FINAL; i++) {
        flows[i] = new RenderFlow2D();
    }
};
