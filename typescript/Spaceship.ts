class Spaceship extends BABYLON.Mesh {

    private _instance: BABYLON.Mesh;
    public thrust: number = 1;
    private _mouseInput: SpaceshipMouseInput;
    private _keyboardInput: SpaceshipKeyboardInput;
    public letterStack: LetterStack;

    public get grid(): LetterGrid {
        return this.main.grid;
    }

    constructor(
        public main: Main
    ) {
        super("Spaceship", main.scene);
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
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._mouseInput = new SpaceshipMouseInput(this);
        this._keyboardInput = new SpaceshipKeyboardInput(this);
        this.getScene().onBeforeRenderObservable.add(this._update);
        this.letterStack = new LetterStack(this.main);
    }

    private _update = () => {
        let deltaTime = this.getEngine().getDeltaTime() / 1000;
        this.translate(BABYLON.Axis.Z, this.thrust * deltaTime, BABYLON.Space.LOCAL);
    }
}