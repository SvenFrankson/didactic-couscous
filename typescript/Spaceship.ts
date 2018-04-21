class Spaceship extends BABYLON.Mesh {

    private _instance: BABYLON.Mesh;
    public thrust: number = 1;
    private _mouseInput: SpaceshipMouseInput;
    private _keyboardInput: SpaceshipKeyboardInput;
    public letterStack: LetterStack;

    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();

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
        this.velocity.addInPlace(
            this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime)
        );
        let dragX = this.getDirection(BABYLON.Axis.X);
        let dragXComp = BABYLON.Vector3.Dot(this.velocity, dragX);
        dragXComp *= Math.abs(dragXComp);
        dragX.scaleInPlace(dragXComp * deltaTime * 0.2);
        let dragZ = this.getDirection(BABYLON.Axis.Z);
        let dragZComp = BABYLON.Vector3.Dot(this.velocity, dragZ);
        if (dragZComp < 0) {
            dragZComp *= 10;
        }
        dragZComp *= Math.abs(dragZComp);
        dragZ.scaleInPlace(dragZComp * deltaTime * 0.02);
        this.velocity.subtractInPlace(dragX).subtractInPlace(dragZ);
        this.position.addInPlace(this.velocity.scale(deltaTime));
        console.log(this.thrust);
    }
}