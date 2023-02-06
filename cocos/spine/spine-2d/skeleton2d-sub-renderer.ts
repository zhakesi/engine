import { ccclass, help } from 'cc.decorator';
import { ModelRenderer } from '../../misc/model-renderer';
import { Material, Texture2D, RenderingSubMesh } from '../../asset/assets';

@ccclass('cc.skeleton2DSubRenderer')
@help('i18n:cc.skeleton2DSubRenderer')
export class skeleton2DSubRenderer extends ModelRenderer {
    private _texture: Texture2D | null = null;

    initialize (tex:Texture2D) {

    }

    onLoad() {

    }

    public update (dt: number) {
    }
}