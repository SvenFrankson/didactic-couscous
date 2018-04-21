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
        this.resize();
        this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
        let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
        light.groundColor.copyFromFloats(0, 0, 0);
        light.intensity = 0.7;
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
        new Invader(this);
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
                this.spaceship.thrust = BABYLON.Scalar.Clamp(BABYLON.Vector3.Distance(this.spaceship.position, pick.pickedPoint) * 0.5, 0, 10);
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
class Bonus extends BABYLON.TransformNode {
    constructor(name, main) {
        super(name, main.scene);
        this.main = main;
    }
    catch() {
    }
}
class BonusGenerator {
    constructor(main) {
        this.main = main;
        this.playerRange = 100;
        this.letterRate = 5000;
        this._checkIntersection = () => {
            for (let i = 0; i < this.bonuses.length; i++) {
                let b = this.bonuses[i];
                if (BABYLON.Vector3.DistanceSquared(b.position, this.spaceship.position) < 9) {
                    this.bonuses.splice(i, 1);
                    b.catch();
                    return;
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
        this._popLetter();
    }
    _popLetter() {
        let letter = new Letter(this.main);
        this.bonuses.push(letter);
        let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
        let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
        letter.position.x = Math.random() * (maxX - minX) + minX;
        letter.position.z = Math.random() * (maxZ - minZ) + minZ;
        setTimeout(() => {
            this._popLetter();
        }, Math.random() * this.letterRate * 1.5);
    }
}
class Letter extends Bonus {
    constructor(main) {
        super("Letter", main);
        this._update = () => {
            this.rotation.y += (Math.sin(this.rotation.y) * 0.03 + 0.06);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/letter_bonus.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
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
class Invader extends BABYLON.Mesh {
    constructor(main) {
        super("Invader", main.scene);
        this.main = main;
        this.thrust = 1;
        this.velocity = BABYLON.Vector3.Zero();
        this._update = () => {
            let deltaTime = this.getEngine().getDeltaTime() / 1000;
            this.thrust = BABYLON.Scalar.Clamp(BABYLON.Vector3.Distance(this.spaceship.position, this.position) * 0.5, 0, 10);
            this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime));
            let dragX = this.getDirection(BABYLON.Axis.X);
            let dragXComp = BABYLON.Vector3.Dot(this.velocity, dragX);
            dragXComp *= Math.abs(dragXComp);
            dragX.scaleInPlace(dragXComp * deltaTime * 0.4);
            let dragZ = this.getDirection(BABYLON.Axis.Z);
            let dragZComp = BABYLON.Vector3.Dot(this.velocity, dragZ);
            if (dragZComp < 0) {
                dragZComp *= 10;
            }
            dragZComp *= Math.abs(dragZComp);
            dragZ.scaleInPlace(dragZComp * deltaTime * 0.04);
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
            let newRight = BABYLON.Vector3.Cross(BABYLON.Axis.Y, newDir);
            let newRotation = BABYLON.Quaternion.Identity();
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(newRight, BABYLON.Axis.Y, newDir, newRotation);
            BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, newRotation, 0.1, this.rotationQuaternion);
        };
        BABYLON.SceneLoader.ImportMesh("", "./models/invader-1.babylon", "", this.getScene(), (meshes) => {
            if (meshes[0]) {
                meshes[0].parent = this;
            }
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
}
