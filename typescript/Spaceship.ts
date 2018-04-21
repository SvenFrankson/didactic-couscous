class Spaceship extends BABYLON.Mesh {

    private _instance: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene) {
        super("Spaceship", scene);
        BABYLON.SceneLoader.ImportMesh(
			"",
			"./models/spaceship.babylon",
			"",
            this.getScene(),
            (meshes) => {
                if (meshes[0]) {
                    meshes[0].parent = this;
                }
            }
		);
    }
}