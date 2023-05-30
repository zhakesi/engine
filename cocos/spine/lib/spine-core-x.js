var spinex;
(function (spinex) {
    var MixBlend;
    (function (MixBlend) {
        MixBlend[MixBlend["setup"] = 0] = "setup";
        MixBlend[MixBlend["first"] = 1] = "first";
        MixBlend[MixBlend["replace"] = 2] = "replace";
        MixBlend[MixBlend["add"] = 3] = "add";
    })(MixBlend = spinex.MixBlend || (spinex.MixBlend = {}));
    var MixDirection;
    (function (MixDirection) {
        MixDirection[MixDirection["mixIn"] = 0] = "mixIn";
        MixDirection[MixDirection["mixOut"] = 1] = "mixOut";
    })(MixDirection = spinex.MixDirection || (spinex.MixDirection = {}));
    var TimelineType;
    (function (TimelineType) {
        TimelineType[TimelineType["rotate"] = 0] = "rotate";
        TimelineType[TimelineType["translate"] = 1] = "translate";
        TimelineType[TimelineType["scale"] = 2] = "scale";
        TimelineType[TimelineType["shear"] = 3] = "shear";
        TimelineType[TimelineType["attachment"] = 4] = "attachment";
        TimelineType[TimelineType["color"] = 5] = "color";
        TimelineType[TimelineType["deform"] = 6] = "deform";
        TimelineType[TimelineType["event"] = 7] = "event";
        TimelineType[TimelineType["drawOrder"] = 8] = "drawOrder";
        TimelineType[TimelineType["ikConstraint"] = 9] = "ikConstraint";
        TimelineType[TimelineType["transformConstraint"] = 10] = "transformConstraint";
        TimelineType[TimelineType["pathConstraintPosition"] = 11] = "pathConstraintPosition";
        TimelineType[TimelineType["pathConstraintSpacing"] = 12] = "pathConstraintSpacing";
        TimelineType[TimelineType["pathConstraintMix"] = 13] = "pathConstraintMix";
        TimelineType[TimelineType["twoColor"] = 14] = "twoColor";
    })(TimelineType = spinex.TimelineType || (spinex.TimelineType = {}));
    var EventType;
    (function (EventType) {
        EventType[EventType["start"] = 0] = "start";
        EventType[EventType["interrupt"] = 1] = "interrupt";
        EventType[EventType["end"] = 2] = "end";
        EventType[EventType["dispose"] = 3] = "dispose";
        EventType[EventType["complete"] = 4] = "complete";
        EventType[EventType["event"] = 5] = "event";
    })(EventType = spinex.EventType || (spinex.EventType = {}));
    var BlendMode;
    (function (BlendMode) {
        BlendMode[BlendMode["Normal"] = 0] = "Normal";
        BlendMode[BlendMode["Additive"] = 1] = "Additive";
        BlendMode[BlendMode["Multiply"] = 2] = "Multiply";
        BlendMode[BlendMode["Screen"] = 3] = "Screen";
    })(BlendMode = spinex.BlendMode || (spinex.BlendMode = {}));
    var TransformMode;
    (function (TransformMode) {
        TransformMode[TransformMode["Normal"] = 0] = "Normal";
        TransformMode[TransformMode["OnlyTranslation"] = 1] = "OnlyTranslation";
        TransformMode[TransformMode["NoRotationOrReflection"] = 2] = "NoRotationOrReflection";
        TransformMode[TransformMode["NoScale"] = 3] = "NoScale";
        TransformMode[TransformMode["NoScaleOrReflection"] = 4] = "NoScaleOrReflection";
    })(TransformMode = spinex.TransformMode || (spinex.TransformMode = {}));
    var PositionMode;
    (function (PositionMode) {
        PositionMode[PositionMode["Fixed"] = 0] = "Fixed";
        PositionMode[PositionMode["Percent"] = 1] = "Percent";
    })(PositionMode = spinex.PositionMode || (spinex.PositionMode = {}));
    var SpacingMode;
    (function (SpacingMode) {
        SpacingMode[SpacingMode["Length"] = 0] = "Length";
        SpacingMode[SpacingMode["Fixed"] = 1] = "Fixed";
        SpacingMode[SpacingMode["Percent"] = 2] = "Percent";
    })(SpacingMode = spinex.SpacingMode || (spinex.SpacingMode = {}));
    var RotateMode;
    (function (RotateMode) {
        RotateMode[RotateMode["Tangent"] = 0] = "Tangent";
        RotateMode[RotateMode["Chain"] = 1] = "Chain";
        RotateMode[RotateMode["ChainScale"] = 2] = "ChainScale";
    })(RotateMode = spinex.RotateMode || (spinex.RotateMode = {}));
    var TextureFilter;
    (function (TextureFilter) {
        TextureFilter[TextureFilter["Nearest"] = 9728] = "Nearest";
        TextureFilter[TextureFilter["Linear"] = 9729] = "Linear";
        TextureFilter[TextureFilter["MipMap"] = 9987] = "MipMap";
        TextureFilter[TextureFilter["MipMapNearestNearest"] = 9984] = "MipMapNearestNearest";
        TextureFilter[TextureFilter["MipMapLinearNearest"] = 9985] = "MipMapLinearNearest";
        TextureFilter[TextureFilter["MipMapNearestLinear"] = 9986] = "MipMapNearestLinear";
        TextureFilter[TextureFilter["MipMapLinearLinear"] = 9987] = "MipMapLinearLinear";
    })(TextureFilter = spinex.TextureFilter || (spinex.TextureFilter = {}));
    var TextureWrap;
    (function (TextureWrap) {
        TextureWrap[TextureWrap["MirroredRepeat"] = 33648] = "MirroredRepeat";
        TextureWrap[TextureWrap["ClampToEdge"] = 33071] = "ClampToEdge";
        TextureWrap[TextureWrap["Repeat"] = 10497] = "Repeat";
    })(TextureWrap = spinex.TextureWrap || (spinex.TextureWrap = {}));
    var AttachmentType;
    (function (AttachmentType) {
        AttachmentType[AttachmentType["Region"] = 0] = "Region";
        AttachmentType[AttachmentType["BoundingBox"] = 1] = "BoundingBox";
        AttachmentType[AttachmentType["Mesh"] = 2] = "Mesh";
        AttachmentType[AttachmentType["LinkedMesh"] = 3] = "LinkedMesh";
        AttachmentType[AttachmentType["Path"] = 4] = "Path";
        AttachmentType[AttachmentType["Point"] = 5] = "Point";
        AttachmentType[AttachmentType["Clipping"] = 6] = "Clipping";
    })(AttachmentType = spinex.AttachmentType || (spinex.AttachmentType = {}));


    spinex.Vector2 = {};
    spinex.MathUtils = {};
    spinex.Color = {};
    spinex.Interpolation = {};
    spinex.Triangulator = {};
    spinex.ConstraintData = {};
    spinex.IkConstraintData = {};
    spinex.PathConstraintData = {};
    spinex.SkeletonBounds = {};
    spinex.Event = {};
    spinex.EventData = {};
    spinex.Attachment = {};
    spinex.VertexAttachment = {};
    spinex.BoundingBoxAttachment = {};
    spinex.ClippingAttachment = {};
    spinex.MeshAttachment = {};
    spinex.PathAttachment = {};
    spinex.PointAttachment = {};
    spinex.RegionAttachment = {};
    spinex.AtlasAttachmentLoader = {};
    spinex.TextureAtlasPage = {};
    spinex.TextureAtlasRegion = {};
    spinex.TextureAtlas = {};
    spinex.PowOut = {};
    spinex.BoneData = {};
    spinex.SlotData = {};
    spinex.Updatable = {};
    spinex.IkConstraint = {};
    spinex.PathConstraint = {};
    spinex.TransformConstraintData = {};
    spinex.TransformConstraint = {};
    spinex.Bone = {};
    spinex.Slot = {};
    spinex.Skin = {};
    spinex.SkinEntry = {};
    spinex.SkeletonClipping = {};
    spinex.SkeletonData = {};
    spinex.TranslateTimeline = {};
    spinex.ScaleTimeline = {};
    spinex.ShearTimeline = {};
    spinex.RotateTimeline = {};
    spinex.ColorTimeline = {};
    spinex.TwoColorTimeline = {};
    spinex.AttachmentTimeline = {};
    spinex.DeformTimeline = {};
    spinex.EventTimeline = {};
    spinex.DrawOrderTimeline = {};
    spinex.IkConstraintTimeline = {};
    spinex.TransformConstraintTimeline = {};
    spinex.PathConstraintPositionTimeline = {};
    spinex.PathConstraintMixTimeline = {};
    spinex.TrackEntry = {};
    spinex.AnimationStateData = {};
    spinex.AnimationState = {};
    spinex.Animation = {};
    spinex.EventQueue = {};
    spinex.AnimationStateListener = {};
    spinex.AnimationStateAdapter = {};
    spinex.Skeleton = {};
    spinex.SkeletonBinary = {};
    spinex.SkeletonJson = {};
    spinex.VertexEffect = {};
    spinex.JitterEffect = {};
    spinex.SwirlEffect = {};

})(spinex || (spinex = {}));
export default spinex;
