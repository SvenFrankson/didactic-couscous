class Letter extends Bonus {

    constructor(main: Main) {
        super("Letter", main);
        BABYLON.SceneLoader.ImportMesh(
			"",
			"./models/letter_bonus.babylon",
			"",
            this.getScene(),
            (meshes) => {
                if (meshes[0]) {
                    meshes[0].parent = this;
                    this.loaded = true;
                    let materials = meshes[0].material;
                    if (materials instanceof BABYLON.MultiMaterial) {
                        materials.subMaterials.forEach(
                            (material) => {
                                if (material.name.indexOf("Letter") !== -1) {
                                    if (material instanceof BABYLON.StandardMaterial) {
                                        material.diffuseTexture = new BABYLON.Texture("textures/letter_bonus.png", this.getScene());
                                        material.diffuseTexture.hasAlpha = true;
                                        material.useAlphaFromDiffuseTexture = true;
                                    }
                                }
                            }
                        )
                    }
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
        this.main.spaceship.letterStack.add(WordValidator.randomLetter());
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}