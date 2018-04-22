class SpaceshipMouseInput {

    public currentDragNDropIndex: number = -1;
    public mouseDown: boolean = false;
    public lockInput: boolean = false;
    public get scene(): BABYLON.Scene {
        return this.spaceship.main.scene;
    }
    public get ground(): BABYLON.Mesh {
        return this.spaceship.main.ground;
    }

    constructor(
        public spaceship: Spaceship
    ) {
        this.scene.onBeforeRenderObservable.add(this._checkInput);
        this.scene.onPointerObservable.add(
            (eventData, eventState) => {
                if (eventData.type === BABYLON.PointerEventTypes._POINTERDOWN) {
                    this.mouseDown = true;
                }
                if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                    this.mouseDown = false;
                    if (this.currentDragNDropIndex !== -1) {
                        let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
                        if (pick && pick.hit) {
                            let letter = this.spaceship.letterStack.removeAt(this.currentDragNDropIndex);
                            if (letter !== "") {
                                this.spaceship.grid.add(letter, pick.pickedPoint);
                            }
                        }
                        this.currentDragNDropIndex = -1;
                    }
                }
            }
        )
    }

    private _checkInput = () => {
        if (this.lockInput ||this.currentDragNDropIndex > -1) {
            this.spaceship.thrust = 0;
            return;
        }
        if (this.mouseDown) {
            this.spaceship.shoot();
        }
        let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
        if (pick && pick.hit) {
            let newDir = pick.pickedPoint.subtract(this.spaceship.position);
            let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
            let newRotation = BABYLON.Quaternion.Identity();
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(
                newRight,
                BABYLON.Axis.Y,
                newDir,
                newRotation
            );
            BABYLON.Quaternion.SlerpToRef(this.spaceship.rotationQuaternion, newRotation, 0.1, this.spaceship.rotationQuaternion);
            this.spaceship.thrust = BABYLON.Scalar.Clamp(
                BABYLON.Vector3.Distance(this.spaceship.position, pick.pickedPoint) * 0.5,
                0,
                10
            );
        }
    }
}