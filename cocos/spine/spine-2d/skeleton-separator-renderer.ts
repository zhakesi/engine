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
    private _visibility = 0;
    public initRenderMesh (tex: Texture2D, visibility:number) {
        this._texture = tex;
    }
    get model () {
        return this._model;
    }

    onEnable () {
        this._model = this.createModel();
        if (this.model) {
            this._attachToScene(this.model);
        }
    }

    onDisable () {
        if (this.model) {
            this._detachFromScene(this.model);
        }
    }

    update () {
        //console.log(`${this.node.name} SkeletonSeparatorRenderer update`);
    }

    lateUpdate () {
        this._onUpdateLocalDescriptorSet();
    }
    get texture () {
        return this._texture;
    }
    set texture (val) {
        this._texture = val;
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

    private _attachToScene (model: Model) {
        if (!this.node.scene) {
            return;
        }
        const renderScene = this._getRenderScene();
        if (model.scene !== null) {
            model.scene.removeModel(model);
        }
        renderScene.addModel(model);
    }

    protected _detachFromScene (model: Model) {
        if (model.scene) {
            model.scene.removeModel(model);
        }
    }

    set visibility (val) {
        this._visibility = val;
    }

    private createModel () {
        const model = (legacyCC.director.root as Root).createModel<Model>(Model);
        model.visFlags = this._visibility;
        model.node = model.transform = this.node;
        return model;
    }
}
