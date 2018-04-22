class Bonus extends BABYLON.Mesh {

    public static easeOutElastic(t) {
        var p = 0.3;
        return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
    }

    public loaded: boolean = false;
    
    constructor(name: string, public main: Main) {
        super(name, main.scene);
        this.position.y = 1;
    }

    public disposeBonus(): void {
        this.main.scene.onBeforeRenderObservable.removeCallback(this._pop);
        this.dispose();
    }

    public catch(): void {

    }

    public pop(): void {
        this.scaling.copyFromFloats(0, 0, 0);
        this.main.scene.onBeforeRenderObservable.add(this._pop);
    }

    private _k: number = 0;
    private _pop = () => {
        this._k ++;
        let size = Bonus.easeOutElastic(BABYLON.Scalar.Clamp(this._k / 60, 0, 1));
        this.scaling.copyFromFloats(
            size, size, size
        );
        if (this._k >= 60) {
            this.scaling.copyFromFloats(1, 1, 1);
            this.main.scene.onBeforeRenderObservable.removeCallback(this._pop);
        }
    }
}