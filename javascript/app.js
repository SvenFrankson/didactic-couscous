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
        this._instance.parent = this;
        this.position.x = (i + 0.5) * LetterGrid.GRID_SIZE;
        this.position.z = (j + 0.5) * LetterGrid.GRID_SIZE;
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
    static get GRID_DISTANCE() {
        return (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE;
    }
    get wordValidator() {
        return this.main.wordValidator;
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
    safeGridIJ(i, j) {
        if (this.grid[i]) {
            return this.grid[i][j];
        }
        return undefined;
    }
    getHorizontalWordAt(i, j) {
        let word = "";
        let firstI = i;
        while (this.safeGridIJ(firstI, j) !== undefined) {
            firstI--;
        }
        firstI++;
        while (this.safeGridIJ(firstI, j) !== undefined) {
            word += this.safeGridIJ(firstI, j).letter;
            firstI++;
        }
        return word;
    }
    getVerticalWordAt(i, j) {
        let word = "";
        let firstJ = j;
        while (this.safeGridIJ(i, firstJ) !== undefined) {
            firstJ++;
        }
        firstJ--;
        while (this.safeGridIJ(i, firstJ) !== undefined) {
            word += this.safeGridIJ(i, firstJ).letter;
            firstJ--;
        }
        return word;
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
        let wordsToCheck = [];
        this.pendingCells.forEach((cell) => {
            let word = this.getHorizontalWordAt(cell.i, cell.j);
            if (word.length > 1 && wordsToCheck.indexOf(word) === -1) {
                console.log(word);
                wordsToCheck.push(word);
            }
            word = this.getVerticalWordAt(cell.i, cell.j);
            if (word.length > 1 && wordsToCheck.indexOf(word) === -1) {
                console.log(word);
                wordsToCheck.push(word);
            }
        });
        let valid = true;
        wordsToCheck.forEach((word) => {
            valid = valid && this.wordValidator.isValid(word);
        });
        if (valid) {
            this._acceptPendingCells();
        }
        else {
            this._rejectPendingCells();
        }
    }
    _acceptPendingCells() {
        console.log("Accept pending cells");
        this.pendingCells.forEach((c) => {
            c.setCorrectState();
            if (Math.random() > 0) {
                this.main.bonusGenerator.popBonus(c.position);
            }
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
        this._letterUISlots = [];
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            let textIcon = new BABYLON.GUI.Image("TextIcon-" + i, "textures/letter_icon.png");
            textIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            textIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            textIcon.left = (20 + (100 + 10) * i) + " px";
            textIcon.top = "20 px";
            textIcon.width = "100px";
            textIcon.height = "100px";
            this.gui.addControl(textIcon);
            let text = new BABYLON.GUI.TextBlock("TextBlock-" + i, "_");
            text.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            text.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            text.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            text.left = (20 + (100 + 10) * i) + " px";
            text.top = "20 px";
            text.width = "100px";
            text.height = "100px";
            text.fontSize = "50px";
            text.color = "black";
            this._letterUISlots[i] = text;
            this.gui.addControl(text);
            let index = new BABYLON.GUI.TextBlock("IndexBlock-" + i, "(" + (i + 1) + ")");
            index.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            index.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            index.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            index.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            index.left = (20 + (100 + 10) * i) + " px";
            index.top = "130 px";
            index.width = "100px";
            index.height = "100px";
            index.fontSize = "20px";
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
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            if (!this.letters[i]) {
                this.letters[i] = l;
                this._updateUI();
                return;
            }
        }
    }
    removeAt(n) {
        let l = "";
        if (this.letters[n]) {
            l = this.letters[n];
            this.letters[n] = "";
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
        this.resize();
        this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
        let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(1, 3, 2)).normalize(), this.scene);
        light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
        light.intensity = 1;
        let ratio = this.canvas.clientWidth / this.canvas.clientHeight;
        let height = 5;
        let width = height * ratio;
        let depth = Math.max(height, width);
        this.ground = BABYLON.MeshBuilder.CreateGround("Ground", {
            width: LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 2,
            height: LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 2
        }, this.scene);
        this.ground.position.x = LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 0.5;
        this.ground.position.y = -0.2;
        this.ground.position.z = LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 0.5;
        this.ground.isVisible = false;
        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100.0 }, this.scene);
        skybox.infiniteDistance = true;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skyboxes/green-nebulae", this.scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        this.grid = new LetterGrid(this);
        this.spaceship = new Spaceship(this);
        this.spaceship.position.copyFromFloats(30, 0, 30);
        let camera = new SpaceshipCamera(this.spaceship);
        this.wordValidator = new WordValidator();
        this.wordValidator.initialize();
        this.bonusGenerator = new BonusGenerator(this);
        this.bonusGenerator.start();
        this.invaderGenerator = new InvaderGenerator(this);
        this.invaderGenerator.start();
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
        this.velocity = BABYLON.Vector3.Zero();
        this._update = () => {
            if (this._coolDown > 0) {
                this._coolDown--;
            }
            let deltaTime = this.getEngine().getDeltaTime() / 1000;
            this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime));
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
        };
        this._coolDown = 0;
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
        this._createUI();
    }
    get grid() {
        return this.main.grid;
    }
    get gui() {
        return this.main.gui;
    }
    _createUI() {
        this.scoreUI = new BABYLON.GUI.TextBlock("ScoreBlock", "SCORE : 0");
        this.scoreUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.scoreUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.scoreUI.left = "40 px";
        this.scoreUI.top = "-40 px";
        this.scoreUI.width = "500px";
        this.scoreUI.height = "100px";
        this.scoreUI.fontSize = "80px";
        this.scoreUI.color = "white";
        this.gui.addControl(this.scoreUI);
        this.hpUI = new BABYLON.GUI.TextBlock("ScoreBlock", "HP : 100");
        this.hpUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.hpUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.hpUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.hpUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.hpUI.left = "-40 px";
        this.hpUI.top = "-40 px";
        this.hpUI.width = "500px";
        this.hpUI.height = "100px";
        this.hpUI.fontSize = "80px";
        this.hpUI.color = "white";
        this.gui.addControl(this.hpUI);
        let staminaIcon = new BABYLON.GUI.Image("StaminaIcon", "textures/stamina_icon.png");
        staminaIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        staminaIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        staminaIcon.left = "-20 px";
        staminaIcon.top = (-128 - 64) + " px";
        staminaIcon.width = "256px";
        staminaIcon.height = "128px";
        this.gui.addControl(staminaIcon);
        this.staminaTextUI = new BABYLON.GUI.TextBlock("staminaTextUI", "LvL 1");
        this.staminaTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.staminaTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.staminaTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.staminaTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.staminaTextUI.left = "-40 px";
        this.staminaTextUI.top = (-128 - 64) + " px";
        this.staminaTextUI.width = "128px";
        this.staminaTextUI.height = "64px";
        this.staminaTextUI.fontSize = "40px";
        this.staminaTextUI.color = "white";
        this.gui.addControl(this.staminaTextUI);
        let shieldIcon = new BABYLON.GUI.Image("ShieldIcon", "textures/shield_icon.png");
        shieldIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        shieldIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shieldIcon.left = "-20 px";
        shieldIcon.top = (-64) + " px";
        shieldIcon.width = "256px";
        shieldIcon.height = "128px";
        this.gui.addControl(shieldIcon);
        this.shieldTextUI = new BABYLON.GUI.TextBlock("shieldTextUI", "LvL 1");
        this.shieldTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.shieldTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.shieldTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.shieldTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.shieldTextUI.left = "-40 px";
        this.shieldTextUI.top = (-64) + " px";
        this.shieldTextUI.width = "128px";
        this.shieldTextUI.height = "64px";
        this.shieldTextUI.fontSize = "40px";
        this.shieldTextUI.color = "white";
        this.gui.addControl(this.shieldTextUI);
        let powerIcon = new BABYLON.GUI.Image("PowerIcon", "textures/power_icon.png");
        powerIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        powerIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        powerIcon.left = "-20 px";
        powerIcon.top = (64) + " px";
        powerIcon.width = "256px";
        powerIcon.height = "128px";
        this.gui.addControl(powerIcon);
        this.powerTextUI = new BABYLON.GUI.TextBlock("powerTextUI", "LvL 1");
        this.powerTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.powerTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.powerTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.powerTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.powerTextUI.left = "-40 px";
        this.powerTextUI.top = (64) + " px";
        this.powerTextUI.width = "128px";
        this.powerTextUI.height = "64px";
        this.powerTextUI.fontSize = "40px";
        this.powerTextUI.color = "white";
        this.gui.addControl(this.powerTextUI);
        let firerateIcon = new BABYLON.GUI.Image("firerateIcon", "textures/firerate_icon.png");
        firerateIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        firerateIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        firerateIcon.left = "-20 px";
        firerateIcon.top = (64 + 128) + " px";
        firerateIcon.width = "256px";
        firerateIcon.height = "128px";
        this.gui.addControl(firerateIcon);
        this.firerateTextUI = new BABYLON.GUI.TextBlock("firerateTextUI", "LvL 1");
        this.firerateTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.firerateTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.firerateTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.firerateTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.firerateTextUI.left = "-40 px";
        this.firerateTextUI.top = (64 + 128) + " px";
        this.firerateTextUI.width = "128px";
        this.firerateTextUI.height = "64px";
        this.firerateTextUI.fontSize = "40px";
        this.firerateTextUI.color = "white";
        this.gui.addControl(this.firerateTextUI);
    }
    shoot() {
        if (this._coolDown > 0) {
            return;
        }
        new Shot(true, this.position, this.getDirection(BABYLON.Axis.Z), 20, 30, 100, this.main);
        this._coolDown = 5;
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
                //this.spaceship.thrust = 10;
            }
            else {
                //this.spaceship.thrust = 0;
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
            for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
                if (e.keyCode === 49 + i) {
                    let letter = this.spaceship.letterStack.removeAt(i);
                    this.spaceship.grid.add(letter, this.spaceship.position);
                }
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
        this.mouseDown = false;
        this._checkInput = () => {
            if (this.mouseDown) {
                this.spaceship.shoot();
            }
            let pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => { return m === this.ground; });
            if (pick && pick.hit) {
                let newDir = pick.pickedPoint.subtract(this.spaceship.position);
                let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
                BABYLON.Quaternion.RotationQuaternionFromAxisToRef(newRight, BABYLON.Axis.Y, newDir, this.spaceship.rotationQuaternion);
                this.spaceship.thrust = BABYLON.Scalar.Clamp(BABYLON.Vector3.Distance(this.spaceship.position, pick.pickedPoint) * 0.5, 0, 10);
            }
        };
        this.scene.onBeforeRenderObservable.add(this._checkInput);
        this.scene.onPointerObservable.add((eventData, eventState) => {
            if (eventData.type === BABYLON.PointerEventTypes._POINTERDOWN) {
                this.mouseDown = true;
            }
            if (eventData.type === BABYLON.PointerEventTypes._POINTERUP) {
                this.mouseDown = false;
            }
        });
    }
    get scene() {
        return this.spaceship.main.scene;
    }
    get ground() {
        return this.spaceship.main.ground;
    }
}
class WordValidator {
    constructor() {
        this._words = [];
    }
    initialize() {
        this._words = [];
        for (let i = 2; i <= WordValidator.MAX_WORD_LENGTH; i++) {
            $.get("dictionnary/en/" + i + ".txt", (data) => {
                this._words[i] = data.split(" ");
                console.log("Words in " + i + " letters : " + this._words[i].length);
            });
        }
    }
    isValid(word) {
        let l = word.length;
        if (l < 2 || l > WordValidator.MAX_WORD_LENGTH) {
            return false;
        }
        else {
            let words = this._words[l];
            console.log("Check word " + word);
            console.log("In " + words.length + " words");
            return words.indexOf(word.toLowerCase()) !== -1;
        }
    }
    static randomLetter() {
        let r = Math.floor(Math.random() * WordValidator.letters.length);
        return WordValidator.letters[r];
    }
}
WordValidator.MAX_WORD_LENGTH = 6;
WordValidator.letters = "EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ";
class Bonus extends BABYLON.Mesh {
    constructor(name, main) {
        super(name, main.scene);
        this.main = main;
        this.loaded = false;
    }
    catch() {
    }
}
class BonusGenerator {
    constructor(main) {
        this.main = main;
        this.playerRange = 100;
        this.letterRate = 30000;
        this._checkIntersection = () => {
            for (let i = 0; i < this.bonuses.length; i++) {
                let b = this.bonuses[i];
                if (b.loaded) {
                    if (BABYLON.Vector3.DistanceSquared(b.position, this.spaceship.position) < 9) {
                        this.bonuses.splice(i, 1);
                        b.catch();
                        return;
                    }
                }
            }
        };
        this.bonuses = [];
        this.main.scene.onBeforeRenderObservable.add(this._checkIntersection);
    }
    get grid() {
        return this.main.grid;
    }
    get spaceship() {
        return this.main.spaceship;
    }
    start() {
        this._popLetterLoop();
    }
    popLetter(pos) {
        let letter = new Letter(this.main);
        this.bonuses.push(letter);
        if (pos) {
            letter.position.copyFrom(pos);
        }
        else {
            let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
            let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
            letter.position.x = Math.random() * (maxX - minX) + minX;
            letter.position.z = Math.random() * (maxZ - minZ) + minZ;
        }
    }
    popBonus(pos) {
        let bonus;
        let r = Math.random();
        if (r > 0.75) {
            bonus = new StaminaBonus(this.main);
        }
        else if (r > 0.5) {
            bonus = new ShieldBonus(this.main);
        }
        else if (r > 0.25) {
            bonus = new PowerBonus(this.main);
        }
        else {
            bonus = new FirerateBonus(this.main);
        }
        this.bonuses.push(bonus);
        if (pos) {
            bonus.position.copyFrom(pos);
        }
        else {
            let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
            let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
            let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
            bonus.position.x = Math.random() * (maxX - minX) + minX;
            bonus.position.z = Math.random() * (maxZ - minZ) + minZ;
        }
    }
    _popLetterLoop() {
        this.popLetter();
        setTimeout(() => {
            this._popLetterLoop();
        }, Math.random() * this.letterRate * 1.5);
    }
}
class FirerateBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/firerate_bonus.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
                this.loaded = true;
            }
        });
        this.position.y = 1;
        this.rotation.x = Math.PI / 4;
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}
class Letter extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/letter_bonus.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
                this.loaded = true;
                let materials = meshes[0].material;
                if (materials instanceof BABYLON.MultiMaterial) {
                    materials.subMaterials.forEach((material) => {
                        if (material.name.indexOf("Letter") !== -1) {
                            if (material instanceof BABYLON.StandardMaterial) {
                                material.diffuseTexture = new BABYLON.Texture("textures/letter_bonus.png", this.getScene());
                                material.diffuseTexture.hasAlpha = true;
                                material.useAlphaFromDiffuseTexture = true;
                            }
                        }
                    });
                }
            }
        });
        this.position.y = 1;
        this.rotation.x = Math.PI / 4;
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.main.spaceship.letterStack.add(WordValidator.randomLetter());
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}
class PowerBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/power_bonus.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
                this.loaded = true;
            }
        });
        this.position.y = 1;
        this.rotation.x = Math.PI / 4;
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}
class ShieldBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/shield_bonus.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
                this.loaded = true;
            }
        });
        this.position.y = 1;
        this.rotation.x = Math.PI / 4;
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}
class StaminaBonus extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            if (this.isDisposed()) {
                return;
            }
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/stamina_bonus.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
                this.loaded = true;
            }
        });
        this.position.y = 1;
        this.rotation.x = Math.PI / 4;
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    catch() {
        this.getScene().onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}
class Invader extends BABYLON.Mesh {
    constructor(main) {
        super("Invader", main.scene);
        this.main = main;
        this.hp = 50;
        this.thrust = 1;
        this.velocity = BABYLON.Vector3.Zero();
        this._update = () => {
            let deltaTime = this.getEngine().getDeltaTime() / 1000;
            let distanceToTarget = BABYLON.Vector3.Distance(this.spaceship.position, this.position);
            if (distanceToTarget > 5) {
                this.thrust = BABYLON.Scalar.Clamp(distanceToTarget * 0.5, 0, 10);
            }
            else {
                this.thrust = 10;
            }
            this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime));
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
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(newRight, BABYLON.Axis.Y, newDir, newRotation);
            BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, newRotation, 0.1, this.rotationQuaternion);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/invader-" + Math.floor(Math.random() * 2 + 1) + ".babylon", "", this.getScene(), (meshes) => {
            meshes.forEach((m) => {
                m.parent = this;
                if (m instanceof BABYLON.Mesh) {
                    m.renderOutline = true;
                    m.outlineColor = BABYLON.Color3.White();
                    m.outlineWidth = 0.025;
                }
            });
        });
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.getScene().onBeforeRenderObservable.add(this._update);
    }
    get grid() {
        return this.main.grid;
    }
    get spaceship() {
        return this.main.spaceship;
    }
    get generator() {
        return this.main.invaderGenerator;
    }
    wound(damage) {
        this.hp -= damage;
        if (this.hp < 0) {
            this.kill();
        }
    }
    kill() {
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
class InvaderGenerator {
    constructor(main) {
        this.main = main;
        this.playerRange = 100;
        this.invaderRate = 5000;
        this.invaders = [];
    }
    get grid() {
        return this.main.grid;
    }
    get spaceship() {
        return this.main.spaceship;
    }
    start() {
        this._popInvader();
    }
    _popInvader() {
        let invader = new Invader(this.main);
        this.invaders.push(invader);
        let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
        let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
        invader.position.x = Math.random() * (maxX - minX) + minX;
        invader.position.z = Math.random() * (maxZ - minZ) + minZ;
        setTimeout(() => {
            this._popInvader();
        }, Math.random() * this.invaderRate * 1.5);
    }
}
class Shot {
    constructor(playerShot, position, direction, speed, damage, range, main) {
        this.playerShot = playerShot;
        this.position = position;
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.main = main;
        this._playerShotUpdate = () => {
            let deltaTime = this.main.engine.getDeltaTime() / 1000;
            this._instance.position.addInPlace(this.direction.scale(this.speed * deltaTime));
            if (this.position.x < -64 ||
                this.position.x > LetterGrid.GRID_DISTANCE + 64 ||
                this.position.z < -64 ||
                this.position.z > LetterGrid.GRID_DISTANCE + 64) {
                this.dispose();
                return;
            }
            for (let i = 0; i < this.generator.invaders.length; i++) {
                let invader = this.generator.invaders[i];
                if (BABYLON.Vector3.DistanceSquared(this._instance.position, invader.position) < 4) {
                    invader.wound(this.damage);
                    this.dispose();
                    return;
                }
            }
        };
        this._instance = BABYLON.MeshBuilder.CreateBox("Shot", { size: 0.25 }, main.scene);
        this._instance.position.copyFrom(position);
        if (playerShot) {
            this.main.scene.onBeforeRenderObservable.add(this._playerShotUpdate);
        }
    }
    get generator() {
        return this.main.invaderGenerator;
    }
    dispose() {
        this.main.scene.onBeforeRenderObservable.removeCallback(this._playerShotUpdate);
        this._instance.dispose();
    }
}
