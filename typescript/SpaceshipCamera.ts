class SpaceshipCamera extends BABYLON.FreeCamera {

    constructor(public spaceship: Spaceship) {
        super(
            "SpaceshipCamera",
            spaceship.position.add(
                new BABYLON.Vector3(0, 20, -5)
            ),
            spaceship.getScene()
        );
        this.setTarget(spaceship.position);
        this.getScene().onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        let newPos = this.spaceship.position.add(
            new BABYLON.Vector3(0, 35, -10)
        )
        this.position = BABYLON.Vector3.Lerp(
            this.position,
            newPos,
            0.1
        );
    }
}