import { CCClass } from '../../core/data/class';
import { ccclass, editable, executeInEditMode, serializable, type } from '../../core/data/decorators';
import { ccenum, Enum } from '../../core/value-types/enum';

export enum SpineSkinEnum {
    default = 0,
}
ccenum(SpineSkinEnum);

export enum SpineAnimationEnum {
    '<None>' = 0,
}
ccenum(SpineAnimationEnum);

export function setEnumAttr (obj, propName, enumDef) {
    CCClass.Attr.setClassAttr(obj, propName, 'type', 'Enum');
    CCClass.Attr.setClassAttr(obj, propName, 'enumList', Enum.getList(enumDef));
}

// @ccclass('cc.SpineBoneSocket')
// @executeInEditMode
// export class SpineBoneSocket {
//     /**
//      * @en Path of the target joint.
//      * @zh 此挂点的目标骨骼路径。
//      */
//     @serializable
//     @editable
//     public path = '';

//     /**
//      * @en Transform output node.
//      * @zh 此挂点的变换信息输出节点。
//      */
//     @type(Node)
//     @editable
//     @serializable
//     public target: Node | null = null;

//     constructor (path = '', target: Node | null = null) {
//         this.path = path;
//         this.target = target;
//     }
// }
