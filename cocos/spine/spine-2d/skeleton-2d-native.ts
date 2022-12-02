import { Skeleton2DImplement } from './skeleton-2d-impl';
import { SkeletonData } from '../skeleton-data';
import { Model } from '../../core/renderer/scene';

export class Skeleton2DNativeImpl extends Skeleton2DImplement {
    public init () {

    }

    get isInit () {
        return true;
    }

    public releaseSkeletonData () {

    }

    public updateSkeletonData (data: SkeletonData) {
        console.log('Skeleton2DWasmImpl::updateSkeletonData');
    }

    public updateRenderData () {

    }

    public updateModel (model : Model) {

    }
}
