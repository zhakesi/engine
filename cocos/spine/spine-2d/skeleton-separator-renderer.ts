import { ccclass } from 'cc.decorator';
import { Component } from '../../scene-graph';
import { legacyCC } from '../../core/global-exports';
import { Model } from '../../render-scene/scene';
import { Root } from '../../root';
import { Texture2D } from '../../asset/assets';
import { ModelLocalBindings } from '../../rendering/define';

@ccclass('cc.SkeletonSeparatorRenderer')
export class SkeletonSeparatorRenderer extends Component {
    private _model: Model | null = null;
    private _texture: Texture2D | null = null;
    public slotStart = '';
    public slotEnd = '';
    constructor () {
        super();
    }

    get model () {
        return this._model;
    }

    onEnable () {
        this.attachToScene();
    }

    onDisable () {
    }

    update () {
        //console.log(`${this.node.name} SkeletonSeparatorRenderer update`);
    }

    lateUpdate () {
        this._onUpdateLocalDescriptorSet();
    }

    protected _onUpdateLocalDescriptorSet () {
        if (!this._texture) return;
        const subModels = this._model!.subModels;
        const binding = ModelLocalBindings.SAMPLER_SPRITE;
        for (let i = 0; i < subModels.length; i++) {
            const { descriptorSet } = subModels[i];
            const texture = this._texture;
            descriptorSet.bindTexture(binding, texture.getGFXTexture()!);
            descriptorSet.bindSampler(binding, texture.getGFXSampler()!);
            descriptorSet.update();
        }
    }

    public attachToScene () {
        if (!this.node.scene || !this._model) {
            return;
        }
        const renderScene = this._getRenderScene();
        if (this._model.scene !== null) {
            this._model.scene.removeModel(this._model);
        }
        renderScene.addModel(this._model);
    }

    public detachFromScene () {
        if (!this._model) return;
        if (this._model.scene) {
            this._model.scene.removeModel(this._model);
        }
    }

    public initModelData (tex:Texture2D, visibility:number) {
        this._model = (legacyCC.director.root as Root).createModel<Model>(Model);
        this._model.visFlags = visibility;
        this._model.node = this._model.transform = this.node;
        this._texture = tex;
    }
}
