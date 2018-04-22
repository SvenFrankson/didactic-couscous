class Invader extends BABYLON.Mesh {

    private _instance: BABYLON.Mesh;

    public hp: number = 50;
    public thrust: number = 1;
    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public get grid(): LetterGrid {
        return this.main.grid;
    }
    public get spaceship(): Spaceship {
        return this.main.spaceship;
    }
    public get generator(): InvaderGenerator {
        return this.main.invaderGenerator;
    }

    constructor(
        public main: Main
    ) {
        super("Invader", main.scene);
        BABYLON.SceneLoader.ImportMesh(
			"",
			"./models/invader-1.babylon",
			"",
            this.getScene(),
            (meshes) => {
                meshes.forEach(
                    (m) => {
                        m.parent = this;
                        if (m instanceof BABYLON.Mesh) {
                            m.renderOutline = true;
                            m.outlineColor = BABYLON.Color3.White();
                            m.outlineWidth = 0.025;
                        }
                    }
                )
            }
        );
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.getScene().onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        let deltaTime = this.getEngine().getDeltaTime() / 1000;
        let distanceToTarget = BABYLON.Vector3.Distance(this.spaceship.position,this.position);
        if (distanceToTarget > 5) {
            this.thrust = BABYLON.Scalar.Clamp(
                distanceToTarget * 0.5,
                0,
                10
            );
        }
        else {
            this.thrust = 10;
        }
        this.velocity.addInPlace(
            this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime)
        );
        let dragX = this.getDirection(BABYLON.Axis.X);
        let dragXComp = BABYLON.Vector3.Dot(this.velocity, dragX);
        dragXComp *= Math.abs(dragXComp);
        dragX.scaleInPlace(dragXComp * deltaTime * 0.8);
        let dragZ = this.getDirection(BABYLON.Axis.Z);
        let dragZComp = BABYLON.Vector3.Dot(this.velocity, dragZ);
        if (dragZComp < 0) {
            dragZComp *= 10;
        }
        dragZComp *= Math.abs(dragZComp);
        dragZ.scaleInPlace(dragZComp * deltaTime * 0.08);

        let framer = BABYLON.Vector3.Zero();
        if (this.position.x < 0) {
            framer.x += Math.abs(this.position.x) * 5 * deltaTime;
        }
        if (this.position.x > (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) {
            framer.x -= Math.abs(this.position.x - (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) * 5 * deltaTime;
        }
        if (this.position.z < 0) {
            framer.z += Math.abs(this.position.z) * 5 * deltaTime;
        }
        if (this.position.z > (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) {
            framer.z -= Math.abs(this.position.z - (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE) * 5 * deltaTime;
        }

        this.velocity.subtractInPlace(dragX).subtractInPlace(dragZ).addInPlace(framer);
        this.position.addInPlace(this.velocity.scale(deltaTime));
        this.position.y = 0;
        
        let newDir = this.spaceship.position.subtract(this.position);
        if (distanceToTarget < 5) {
            newDir.scaleInPlace(-1);
        }
        let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
        let newRotation = BABYLON.Quaternion.Identity();
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(
            newRight,
            BABYLON.Axis.Y,
            newDir,
            newRotation
        );
        BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, newRotation, 0.1, this.rotationQuaternion);
    }

    public wound(damage: number) {
        this.hp -= damage;
        if (this.hp < 0) {
            this.kill();
        }
    }

    public kill() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        let index = this.generator.invaders.indexOf(this);
        if (index !== -1) {
            this.generator.invaders.splice(index, 1);
        }
        if (Math.random() > 0.5) {
            this.main.bonusGenerator.popLetter(this.position);
        }
        this.dispose();
    }
}