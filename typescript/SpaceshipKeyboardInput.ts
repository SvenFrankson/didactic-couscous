class SpaceshipKeyboardInput {

    public static forwardKey = "w";
    public static backKey = "s";
    public static leftKey = "a";
    public static rightKey = "d";

    public static AzertyMode(): void {
        SpaceshipKeyboardInput.forwardKey = "z";
        SpaceshipKeyboardInput.backKey = "s";
        SpaceshipKeyboardInput.leftKey = "q";
        SpaceshipKeyboardInput.rightKey = "d";
    }

    public static QwertyMode(): void {
        SpaceshipKeyboardInput.forwardKey = "w";
        SpaceshipKeyboardInput.backKey = "s";
        SpaceshipKeyboardInput.leftKey = "a";
        SpaceshipKeyboardInput.rightKey = "d";
    }

    private leftKeyDown: boolean = false;
    private upKeyDown: boolean = false;
    private rightKeyDown: boolean = false;
    private downKeyDown: boolean = false;
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
                if (e.keyCode === 37 || e.key === SpaceshipKeyboardInput.leftKey) {
                    this.leftKeyDown = false;
                }
                if (e.keyCode === 38 || e.key === SpaceshipKeyboardInput.forwardKey) {
                    this.upKeyDown = false;
                }
                if (e.keyCode === 39 || e.key === SpaceshipKeyboardInput.rightKey) {
                    this.rightKeyDown = false;
                }
                if (e.keyCode === 40 || e.key === SpaceshipKeyboardInput.backKey) {
                    this.downKeyDown = false;
                }
            }
        )
        this.canvas.addEventListener(
            "keydown",
            (e) => {
                if (e.keyCode === 32) {
                    this.spacekeyDown = true;
                }
                if (e.keyCode === 37 || e.key === SpaceshipKeyboardInput.leftKey) {
                    this.leftKeyDown = true;
                }
                if (e.keyCode === 38 || e.key === SpaceshipKeyboardInput.forwardKey) {
                    this.upKeyDown = true;
                }
                if (e.keyCode === 39 || e.key === SpaceshipKeyboardInput.rightKey) {
                    this.rightKeyDown = true;
                }
                if (e.keyCode === 40 || e.key === SpaceshipKeyboardInput.backKey) {
                    this.downKeyDown = true;
                }
            }
        )
        this.canvas.addEventListener(
            "keydown",
            (e) => {
                for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
                    if (e.keyCode === 49 + i) {
                        let letter = this.spaceship.letterStack.removeAt(i);
                        this.spaceship.grid.add(letter, this.spaceship.position);
                    }
                }
            }
        )
        this.scene.onBeforeRenderObservable.add(this._checkInput);
    }

    private _checkInput = () => {
        if (this.downKeyDown && this.upKeyDown) {
            this.spaceship.thrust = 0;
        }
        else if (this.downKeyDown) {
            this.spaceship.thrust = -10;
        }
        else if (this.upKeyDown) {
            this.spaceship.thrust = 10;
        }
        else {
            this.spaceship.thrust = 0;
        }
        
        if (this.leftKeyDown && this.rightKeyDown) {
            this.spaceship.straff = 0;
        }
        else if (this.leftKeyDown) {
            this.spaceship.straff = -10;
        }
        else if (this.rightKeyDown) {
            this.spaceship.straff = 10;
        }
        else {
            this.spaceship.straff = 0;
        }
    }
}