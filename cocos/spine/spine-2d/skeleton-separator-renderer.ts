import { ccclass } from 'cc.decorator';
import { Component } from '../../scene-graph';
import { legacyCC } from '../../core/global-exports';
import { Model } from '../../render-scene/scene';
import { Root } from '../../root';
import { Texture2D } from '../../asset/assets';

@ccclass('cc.SkeletonSeparatorRenderer')
export class SkeletonSeparatorRenderer extends Component {
    private _model: Model | null = null;
    private _texture: Texture2D | null = null;
    public initRenderMesh (tex: Texture2D, visibility:number) {
        this._texture = tex;
        const model = (legacyCC.director.root as Root).createModel<Model>(Model);
        this._model = model;
        model.visFlags = visibility;
        model.node = model.transform = this.node;
    }

    update () {
        console.log(this.node.name);
    }
}
