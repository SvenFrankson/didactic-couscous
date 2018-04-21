class SpaceshipKeyboardInput {

    private spacekeyDown: boolean = false;
    public get scene(): BABYLON.Scene {
        return this.spaceship.main.scene;
    }
    public get canvas(): HTMLCanvasElement {
        return this.spaceship.main.canvas;
    }

    constructor(
        public spaceship: Spaceship
    ) {
        this.canvas.addEventListener(
            "keyup",
            (e) => {
                if (e.keyCode === 32) {
                    this.spacekeyDown = false;
                }
            }
        )
        this.canvas.addEventListener(
            "keydown",
            (e) => {
                if (e.keyCode === 32) {
                    this.spacekeyDown = true;
                }
            }
        )
        this.canvas.addEventListener(
            "keydown",
            (e) => {
                if (e.keyCode === 49) {
                    let letter = this.spaceship.letterStack.removeAt(0);
                    this.spaceship.grid.add(letter, this.spaceship.position);
                }
            }
        )
        this.scene.onBeforeRenderObservable.add(this._checkInput);
    }

    private _checkInput = () => {
        if (this.spacekeyDown) {
            this.spaceship.thrust = this.spaceship.thrust * 0.9 + 10 * 0.1;
        }
        else {
            this.spaceship.thrust = this.spaceship.thrust * 0.9 + 0 * 0.1;
        }
    }
}