class PowerBonus extends Bonus {

    constructor(main: Main) {
        super("Letter", main);
        BABYLON.SceneLoader.ImportMesh(
			"",
			"./models/power_bonus.babylon",
			"",
            this.getScene(),
            (meshes) => {
                if (meshes[0]) {
                    meshes[0].parent = this;
                    this.loaded = true;
                }
            }
        );
        this.position.y = 1;
        this.rotation.x = Math.PI / 4;
        this.getScene().onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        if (this.isDisposed()) {
            return;
        }
        this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06)
    }

    public catch(): void {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}