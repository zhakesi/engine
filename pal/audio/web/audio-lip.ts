const SAMPLE_RATE = 48000;
const SAMPLE_BLOCK = 1000;
export class AudioLip {
    public _audioBuf : AudioBuffer = null!;

    private _paramter : Float32Array = null!;
    private _length  = 0;
    private _sqt1  = 0;
    private _sqt2  = 0;
    private _rawBuf: Float32Array = null!;
    private _spectrum: Float32Array = null!;

    private _kiss0 = 0;
    private _kiss1 = 0;
    private _press0 = 0;
    private _press1 = 0;
    private _open0 = 0;
    private _open1 = 0;

    public Init (audioBuf:AudioBuffer) : void {
        this._audioBuf = audioBuf;
        this._rawBuf = audioBuf.getChannelData(0);
        this.ConfigParams(SAMPLE_BLOCK);
        this._spectrum = new Float32Array(SAMPLE_BLOCK);
    }
    public ComputeShapeWeight (current:number) : number[] {
        let weights = [0, 0, 0]; // [kiss, press, open]
        const offset = Math.floor(current * this._audioBuf.sampleRate);
        if (offset + SAMPLE_BLOCK + 2 > this._audioBuf.sampleRate * this._audioBuf.duration) {
            return weights;
        }
        this.DCTSpectrum1D(this._rawBuf, offset);
        weights = this.AnalyzeShape();

        weights[0] = 0.5 * weights[0] + 0.35 * this._kiss0 + 0.15 * this._kiss1;
        weights[1] = 0.5 * weights[1] + 0.35 * this._press0 + 0.15 * this._press1;
        weights[2] = 0.5 * weights[2] + 0.35 * this._open0 + 0.15 * this._open1;

        this._kiss0 = weights[0];
        this._press0 = weights[1];
        this._open0 = weights[2];

        this._kiss1 = this._kiss0;
        this._press1 = this._press0;
        this._open1 = this._open0;

        return weights;
    }

    private ConfigParams (length:number) {
        this._length = length;
        this._paramter = new Float32Array(length * length);
        this._sqt1 = Math.sqrt(1.0 / length);
        this._sqt2 = Math.sqrt(2.0 / length);

        let i:number;
        for (i = 0; i < length; i++) {
            this._paramter[i] = this._sqt1;
        }
        let m:number;
        let k:number;
        for (m = 1; m < length; ++m) {
            for (k = 0; k < length; ++k) {
                this._paramter[m * length + k] = this._sqt2 * Math.cos((3.14 / length) * m * (k + 0.5));
            }
        }
        console.log('DCT::InitParams');
    }

    private DCTSpectrum1D (src:Float32Array, offset:number):void {
        let i = 0;
        for (i = 0; i < this._length; i++) {
            this._spectrum[0] += src[offset + i];
        }
        this._spectrum[0] /= this._length;
        if (this._spectrum[0] < 0) {
            this._spectrum[0] = -this._spectrum[0];
        }
        let m:number;
        let k:number;
        for (m = 1; m < this._length; ++m) {
            this._spectrum[m] = 0;
            for (k = 0; k < this._length; ++k) {
                this._spectrum[m] += src[offset + k] * this._paramter[m * this._length + k];
            }
            this._spectrum[m] *= this._sqt2;
            if (this._spectrum[m] < 0) {
                this._spectrum[m] = -this._spectrum[m];
            }
        }
    }

    private Clamp (val: number, mi : number, ma :number) : number {
        let ret = val;
        if (ret < mi) {
            ret = mi;
        } else if (ret > ma) {
            ret = ma;
        }
        return ret;
    }

    public AnalyzeShape (): number[] {
        let i :number;
        let blendKissShape  = 0;
        let blendLipsPressedShape  = 0;
        let blendMouthOpenShape  = 0;

        const sensitivityThreshold = 0.4;
        const length = this._spectrum.length;
        for (i = 0; i < this._length; i++) {
            this._spectrum[i] = 20.0 * Math.log10(this._spectrum[i]);
            this._spectrum[i] = sensitivityThreshold + (this._spectrum[i] + 20) / 140.0;
        }

        const voiceBoundingFrequencies : number[] = [0, 500, 700, 3000, 6000];
        const vocalTractLengthFactor = 1.0;
        const frequencyDataIndices : number[] = [0, 0, 0, 0, 0];
        for (i = 0; i < 5; i++) {
            voiceBoundingFrequencies[i] = Math.floor(voiceBoundingFrequencies[i] * vocalTractLengthFactor);
            frequencyDataIndices[i] = Math.floor(2.0 * length / SAMPLE_RATE * voiceBoundingFrequencies[i]);
        }

        const binEnergy : number[] = [0, 0, 0, 0, 0];
        for (i = 0; i < 4; i++) {
            const index0 = frequencyDataIndices[i];
            const index1 = frequencyDataIndices[i + 1];
            const binLength : number = index1 - index0;
            let j = 0;
            for (j = index0; j < index1; j++) {
                binEnergy[i] += this._spectrum[j] > 0 ? this._spectrum[j] : 0;
            }
            binEnergy[i] /= binLength;
        }
        if (binEnergy[1] >= 0.2) {
            blendKissShape = 1.0 - 2 * binEnergy[2];
            blendKissShape = this.Clamp(blendKissShape, 0, 1);
        } else {
            blendKissShape = (1 - 2 * binEnergy[2]) * 5 * binEnergy[1];
            blendKissShape = this.Clamp(blendKissShape, 0, 1);
        }

        blendLipsPressedShape = 3 * binEnergy[3];
        blendLipsPressedShape = this.Clamp(blendLipsPressedShape, 0, 1);

        // Mouth open shape
        blendMouthOpenShape = 0.8 * (binEnergy[1] - binEnergy[3]);
        blendMouthOpenShape = this.Clamp(blendMouthOpenShape, 0, 1);

        const weights : number[] = [blendKissShape, blendLipsPressedShape, blendMouthOpenShape];
        return weights;
    }
}
