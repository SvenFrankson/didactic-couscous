class Main {
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 0);
        this.resize();
        let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
        light.groundColor.copyFromFloats(0, 0, 0);
        light.intensity = 0.7;
        let ratio = this.canvas.clientWidth / this.canvas.clientHeight;
        let height = 5;
        let width = height * ratio;
        let depth = Math.max(height, width);
        this.ground = BABYLON.MeshBuilder.CreateGround("Ground", { width: 100, height: 100 }, this.scene);
        let groundMaterial = new BABYLON.StandardMaterial("GroundMaterial", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("qsdpoiqspdoiqsd", this.scene);
        this.ground.material = groundMaterial;
        let player = new Spaceship(this);
        let camera = new SpaceshipCamera(player);
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    resize() {
        this.engine.resize();
    }
}
window.addEventListener("DOMContentLoaded", () => {
    let game = new Main("render-canvas");
    game.createScene();
    game.animate();
});
class Spaceship extends BABYLON.Mesh {
    constructor(main) {
        super("Spaceship", main.scene);
        this.main = main;
        this.thrust = 1;
        this._update = () => {
            let deltaTime = this.getEngine().getDeltaTime() / 1000;
            this.translate(BABYLON.Axis.Z, this.thrust * deltaTime, BABYLON.Space.LOCAL);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/spaceship.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
            }
        });
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this._mouseInput = new SpaceshipMouseInput(this);
        this._keyboardInput = new SpaceshipKeyboardInput(this);
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
}
class SpaceshipCamera extends BABYLON.FreeCamera {
    constructor(spaceship) {
        super("SpaceshipCamera", spaceship.position.add(new BABYLON.Vector3(0, 20, -5)), spaceship.getScene());
        this.spaceship = spaceship;
        this._update = () => {
            let newPos = this.spaceship.position.add(new BABYLON.Vector3(0, 20, -5));
            this.position = BABYLON.Vector3.Lerp(this.position, newPos, 0.1);
        };
        this.setTarget(spaceship.position);
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
}
class SpaceshipKeyboardInput {
    constructor(spaceship) {
        this.spaceship = spaceship;
        this.spacekeyDown = false;
        this._checkInput = () => {
            if (this.spacekeyDown) {
                this.spaceship.thrust = this.spaceship.thrust * 0.9 + 10 * 0.1;
            }
            else {
                this.spaceship.thrust = this.spaceship.thrust * 0.9 + 0 * 0.1;
            }
        };
        this.canvas.addEventListener("keyup", (e) => {
            if (e.keyCode === 32) {
                this.spacekeyDown = false;
            }
        });
        this.canvas.addEventListener("keydown", (e) => {
            if (e.keyCode === 32) {
                this.spacekeyDown = true;
            }
        });
        this.scene.onBeforeRenderObservable.add(this._checkInput);
    }
    get scene() {
        return this.spaceship.main.scene;
    }
    get canvas() {
        return this.spaceship.main.canvas;
    }
}
class SpaceshipMouseInput {
    constructor(spaceship) {
        this.spaceship = spaceship;
        this._checkInput = () => {
            let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
            if (pick && pick.hit) {
                let newDir = pick.pickedPoint.subtract(this.spaceship.position);
                let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
                BABYLON.Quaternion.RotationQuaternionFromAxisToRef(newRight, BABYLON.Axis.Y, newDir, this.spaceship.rotationQuaternion);
            }
        };
        this.scene.onBeforeRenderObservable.add(this._checkInput);
    }
    get scene() {
        return this.spaceship.main.scene;
    }
    get ground() {
        return this.spaceship.main.ground;
    }
}
