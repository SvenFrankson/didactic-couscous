class FirerateBonus extends Bonus {

    constructor(main: Main) {
        super("Letter", main);
        BABYLON.SceneLoader.ImportMesh(
			"",
			"./models/bonus.babylon",
			"",
            this.getScene(),
            (meshes) => {
                meshes.forEach(
                    (m) => {
                        m.parent = this;
                        if (m.material instanceof BABYLON.StandardMaterial) {
                            if (m.material.name.indexOf("ring") > -1) {
                                m.material.diffuseColor = BABYLON.Color3.FromHexString("#de6715");
                                m.renderOutline = true;
                                m.outlineColor = BABYLON.Color3.White();
                                m.outlineWidth = 0.025;
                            }
                            else if (m.material.name.indexOf("plane") > -1) {
                                m.material.diffuseTexture = new BABYLON.Texture("textures/firerate_icon.png", Main.instance.scene);
                                m.material.diffuseTexture.hasAlpha = true;
                                m.material.useAlphaFromDiffuseTexture;
                            } 
                        }
                    }
                );
                this.loaded = true;
            }
        );
        this.position.y = 1.5;
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
        this.main.spaceship.upFirerate();
        this.dispose();
    }
}