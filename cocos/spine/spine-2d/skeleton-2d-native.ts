import { Skeleton2DImplement } from './skeleton-2d-impl';
import { SkeletonData } from '../skeleton-data';

export class Skeleton2DNativeImpl extends Skeleton2DImplement {
    public init () {

    }

    public releaseSkeletonData () {

    }

    public updateSkeletonData (data: SkeletonData) {
        console.log('Skeleton2DWasmImpl::updateSkeletonData');
    }

    public updateRenderData () {

    }

    public render () {

    }
}
