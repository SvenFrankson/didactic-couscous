class LetterCell extends BABYLON.Mesh {
    constructor(letter, i, j, grid) {
        super("LetterCell-" + i + "-" + j, grid.scene);
        this.letter = letter;
        this.i = i;
        this.j = j;
        this.grid = grid;
        this._instance = BABYLON.MeshBuilder.CreateGround(this.name + "_mesh", {
            width: LetterGrid.GRID_SIZE * 0.9,
            height: LetterGrid.GRID_SIZE * 0.9
        }, this.getScene());
        this._instance.position.x = (i + 0.5) * LetterGrid.GRID_SIZE;
        this._instance.position.z = (j + 0.5) * LetterGrid.GRID_SIZE;
        let texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this._instance);
        this._textBlock = new BABYLON.GUI.TextBlock("l", this.letter);
        this._textBlock.fontSize = 1000;
        this._textBlock.color = "white";
        texture.addControl(this._textBlock);
    }
    setPendingState() {
        if (this._textBlock) {
            this._textBlock.color = "blue";
        }
    }
    setWrongState() {
        if (this._textBlock) {
            this._textBlock.color = "red";
        }
    }
    setCorrectState() {
        if (this._textBlock) {
            this._textBlock.color = "white";
        }
    }
    kill() {
        this._textBlock.dispose();
        this._instance.dispose();
        this.dispose();
        this.grid.grid[this.i][this.j] = undefined;
    }
}
class LetterGrid {
    constructor(main) {
        this.main = main;
        this._throttle = 0;
        this._lastPendingCellCount = 0;
        this._checkPendingCells = () => {
            if (this.pendingCells.length > 0) {
                if (this.pendingCells.length !== this._lastPendingCellCount) {
                    this._lastPendingCellCount = this.pendingCells.length;
                    this._throttle = 0;
                    return;
                }
                else {
                    this._throttle += this.engine.getDeltaTime() / 1000;
                    if (this._throttle > LetterGrid.PENDING_DELAY) {
                        this._throttle = 0;
                        this._validatePendingCells();
                    }
                }
            }
        };
        this.grid = [];
        this.pendingCells = [];
        this.initialize();
        this.scene.onBeforeRenderObservable.add(this._checkPendingCells);
    }
    get scene() {
        return this.main.scene;
    }
    get engine() {
        return this.main.engine;
    }
    initialize() {
        let lines = [];
        for (let i = 0; i <= LetterGrid.GRID_LENGTH; i++) {
            lines[i] = [];
            lines[i].push(new BABYLON.Vector3(i * LetterGrid.GRID_SIZE, 0, 0), new BABYLON.Vector3(i * LetterGrid.GRID_SIZE, 0, (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE));
        }
        for (let i = 0; i <= LetterGrid.GRID_LENGTH; i++) {
            lines[i + LetterGrid.GRID_LENGTH + 1] = [];
            lines[i + LetterGrid.GRID_LENGTH + 1].push(new BABYLON.Vector3(0, 0, i * LetterGrid.GRID_SIZE), new BABYLON.Vector3((LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE, 0, i * LetterGrid.GRID_SIZE));
        }
        BABYLON.MeshBuilder.CreateLineSystem("GridLineMesh", {
            lines: lines,
            updatable: false,
            instance: undefined
        }, this.scene);
    }
    worldToGrid(world) {
        let gridPosition = BABYLON.Vector2.Zero();
        gridPosition.x = Math.floor(world.x / LetterGrid.GRID_SIZE);
        gridPosition.y = Math.floor(world.z / LetterGrid.GRID_SIZE);
        return gridPosition;
    }
    add(l, world) {
        let gridPosition = this.worldToGrid(world);
        if (gridPosition.x >= 0 && gridPosition.x < LetterGrid.GRID_LENGTH) {
            if (gridPosition.y >= 0 && gridPosition.y < LetterGrid.GRID_LENGTH) {
                let i = Math.floor(gridPosition.x);
                let j = Math.floor(gridPosition.y);
                if (!this.grid[i]) {
                    this.grid[i] = [];
                }
                if (!this.grid[i][j]) {
                    let newCell = new LetterCell(l, i, j, this);
                    this.grid[i][j] = newCell;
                    this.pendingCells.push(newCell);
                    newCell.setPendingState();
                }
            }
        }
    }
    _validatePendingCells() {
        // Check for pendingCells alignment.
        let deltaI = 0;
        let deltaJ = 0;
        for (let i = 0; i < this.pendingCells.length; i++) {
            let cell0 = this.pendingCells[i];
            for (let j = 0; j < this.pendingCells.length && j !== i; j++) {
                let cell1 = this.pendingCells[j];
                deltaI += Math.abs(cell0.i - cell1.i);
                deltaJ += Math.abs(cell0.j - cell1.j);
            }
        }
        if (deltaI > 0 && deltaJ > 0) {
            return this._rejectPendingCells();
        }
        this._acceptPendingCells();
    }
    _acceptPendingCells() {
        console.log("Accept pending cells");
        this.pendingCells.forEach((c) => {
            c.setCorrectState();
        });
        this.pendingCells = [];
    }
    _rejectPendingCells() {
        console.log("Reject pending cells");
        this.pendingCells.forEach((c) => {
            c.setWrongState();
            setTimeout(() => {
                c.kill();
            }, 3000);
        });
        this.pendingCells = [];
    }
}
LetterGrid.GRID_LENGTH = 128;
LetterGrid.GRID_SIZE = 4;
LetterGrid.PENDING_DELAY = 5;
class LetterStack {
    constructor(main) {
        this.main = main;
        this.letters = [];
        this._createUI();
        // debug fill
        this.add("T");
        this.add("E");
        this.add("S");
        this.add("T");
        this.add("O");
        this.add("S");
        this.add("T");
    }
    get gui() {
        return this.main.gui;
    }
    _createUI() {
        console.log("!");
        this._letterUISlots = [];
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            let text = new BABYLON.GUI.TextBlock("TextBlock-" + i, "_");
            text.left = (0 + (100 + 10) * i - 600) + " px";
            text.top = "-500 px";
            text.width = "100 px";
            text.height = "50 px";
            text.fontSize = "30px";
            text.color = "white";
            this._letterUISlots[i] = text;
            this.gui.addControl(text);
            let index = new BABYLON.GUI.TextBlock("IndexBlock-" + i, "(" + (i + 1) + ")");
            index.left = (0 + (100 + 10) * i - 600) + " px";
            index.top = "-470 px";
            index.width = "100 px";
            index.height = "20 px";
            index.fontSize = "15px";
            index.color = "white";
            this.gui.addControl(index);
        }
    }
    _updateUI() {
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            if (this.letters[i]) {
                this._letterUISlots[i].text = this.letters[i];
            }
            else {
                this._letterUISlots[i].text = "_";
            }
        }
    }
    add(l) {
        if (this.letters.length < LetterStack.MAX_LENGTH) {
            this.letters.push(l);
        }
        this._updateUI();
    }
    removeAt(n) {
        let l = "";
        if (this.letters[n]) {
            l = this.letters[n];
            this.letters.splice(n, 1);
        }
        this._updateUI();
        return l;
    }
}
LetterStack.MAX_LENGTH = 7;
class Main {
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true);
    }
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 0);
        this.resize();
        this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
        let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
        light.groundColor.copyFromFloats(0, 0, 0);
        light.intensity = 0.7;
        let ratio = this.canvas.clientWidth / this.canvas.clientHeight;
        let height = 5;
        let width = height * ratio;
        let depth = Math.max(height, width);
        this.ground = BABYLON.MeshBuilder.CreateGround("Ground", { width: 100, height: 100 }, this.scene);
        this.ground.position.y = -0.2;
        let groundMaterial = new BABYLON.StandardMaterial("GroundMaterial", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("qsdpoiqspdoiqsd", this.scene);
        this.ground.material = groundMaterial;
        this.grid = new LetterGrid(this);
        let player = new Spaceship(this);
        player.position.copyFromFloats(30, 0, 30);
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
        this.letterStack = new LetterStack(this.main);
    }
    get grid() {
        return this.main.grid;
    }
}
class SpaceshipCamera extends BABYLON.FreeCamera {
    constructor(spaceship) {
        super("SpaceshipCamera", spaceship.position.add(new BABYLON.Vector3(0, 20, -5)), spaceship.getScene());
        this.spaceship = spaceship;
        this._update = () => {
            let newPos = this.spaceship.position.add(new BABYLON.Vector3(0, 35, -10));
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
        this.canvas.addEventListener("keydown", (e) => {
            if (e.keyCode === 49) {
                let letter = this.spaceship.letterStack.removeAt(0);
                this.spaceship.grid.add(letter, this.spaceship.position);
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
