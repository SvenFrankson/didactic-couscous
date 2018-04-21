class SpaceshipMouseInput {

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
    }

    private _checkInput = () => {
        let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
        if (pick && pick.hit) {
            let newDir = pick.pickedPoint.subtract(this.spaceship.position);
            let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(
                newRight,
                BABYLON.Axis.Y,
                newDir,
                this.spaceship.rotationQuaternion
            );
        }
    }
}