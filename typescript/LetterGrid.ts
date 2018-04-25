class LetterCell extends BABYLON.Mesh{

    private _instance: BABYLON.Mesh;
    private _textBlock: BABYLON.GUI.TextBlock;

    constructor(
        public letter: string,
        public i: number,
        public j: number,
        public grid: LetterGrid
    ) {
        super("LetterCell-" + i + "-" + j, grid.scene);
        this._instance = BABYLON.MeshBuilder.CreateGround(
            this.name + "_mesh",
            {
                width: LetterGrid.GRID_SIZE * 0.9,
                height: LetterGrid.GRID_SIZE * 0.9
            },
            this.getScene()
        );
        this._instance.parent = this;
        this.position.x = (i + 0.5) * LetterGrid.GRID_SIZE;
        this.position.z = (j + 0.5) * LetterGrid.GRID_SIZE;
        let texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this._instance);
        this._textBlock = new BABYLON.GUI.TextBlock("l", this.letter);
        this._textBlock.fontSize = 1000;
        this._textBlock.color = "white";
        texture.addControl(this._textBlock);
    }

    public setPendingState(): void {
        if (this._textBlock) {
            this._textBlock.color = "blue";
        }
    }

    public setWrongState(): void {
        if (this._textBlock) {
            this._textBlock.color = "red";
        }
    }

    public setCorrectState(): void {
        if (this._textBlock) {
            this._textBlock.color = "white";
        }
    }

    public kill(): void {
        this._textBlock.dispose();
        this._instance.dispose();
        this.dispose();
        this.grid.grid[this.i][this.j] = undefined;
    }
}

class LetterGrid {

    public static readonly GRID_LENGTH: number = 128;
    public static readonly GRID_SIZE: number = 4;
    public static get GRID_DISTANCE(): number {
        return (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE;
    }
    public static readonly PENDING_DELAY: number = 5;
    public grid: LetterCell[][];
    public pendingCells: LetterCell[];

    public get wordValidator(): WordValidator {
        return this.main.wordValidator;
    }
    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }
    public get engine(): BABYLON.Engine {
        return this.main.engine;
    }

    constructor(
        public main: Main
    ) {
        this.grid = [];
        this.pendingCells = [];
        this.initialize();
        this.scene.onBeforeRenderObservable.add(this._checkPendingCells);
    }

    public initialize(): void {
        let lines: BABYLON.Vector3[][] = [];
        for (let i = 0; i <= LetterGrid.GRID_LENGTH; i++) {
            lines[i] = [];
            lines[i].push(
                new BABYLON.Vector3(
                    i * LetterGrid.GRID_SIZE,
                    0,
                    0
                ),
                new BABYLON.Vector3(
                    i * LetterGrid.GRID_SIZE,
                    0,
                    (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE
                )
            );
        }
        for (let i = 0; i <= LetterGrid.GRID_LENGTH; i++) {
            lines[i + LetterGrid.GRID_LENGTH + 1] = [];
            lines[i + LetterGrid.GRID_LENGTH + 1].push(
                new BABYLON.Vector3(
                    0,
                    0,
                    i * LetterGrid.GRID_SIZE
                ),
                new BABYLON.Vector3(
                    (LetterGrid.GRID_LENGTH + 1) * LetterGrid.GRID_SIZE,
                    0,
                    i * LetterGrid.GRID_SIZE
                )
            );
        }
        BABYLON.MeshBuilder.CreateLineSystem(
            "GridLineMesh",
            {
                lines: lines,
                updatable: false,
                instance: undefined
            },
            this.scene
        );
    }

    public worldToGrid(world: BABYLON.Vector3): BABYLON.Vector2 {
        let gridPosition = BABYLON.Vector2.Zero();
        gridPosition.x = Math.floor(world.x / LetterGrid.GRID_SIZE);
        gridPosition.y = Math.floor(world.z / LetterGrid.GRID_SIZE);
        return gridPosition;
    }

    public add(l: string, world: BABYLON.Vector3) {
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

    public safeGridIJ(i: number, j: number): LetterCell {
        if (this.grid[i]) {
            return this.grid[i][j];
        }
        return undefined;
    }

    public getHorizontalWordAt(i: number, j: number): string {
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

    public getVerticalWordAt(i: number, j: number): string {
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

    private _throttle: number = 0;
    private _lastPendingCellCount: number = 0;
    private _checkPendingCells = () => {
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
    }

    private _validatePendingCells(): void {
        // Check for pendingCells alignment.
        let deltaI: number = 0;
        let deltaJ: number = 0;
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

        let wordsToCheck: string[] = [];
        this.pendingCells.forEach(
            (cell) => {
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
            }
        )
        if (wordsToCheck.length === 0) {
            return this._rejectPendingCells();
        }
        let valid = true;
        wordsToCheck.forEach(
            (word) => {
                valid = valid && this.wordValidator.isValid(word);
            }
        )
        if (valid) {
            this._acceptPendingCells();
        } else {
            this._rejectPendingCells();
        }
    }

    private _acceptPendingCells(): void {
        TipsGenerator.ShowRandomGood();
        this.main.goodSound.play();
        let counter = 0;
        let l = Math.floor(this.pendingCells.length / 2);
        this.main.spaceship.score += l * l * 10;
        this.main.spaceship.words ++;
        this.pendingCells.forEach(
            (c) => {
                c.setCorrectState();
                for (let i = 0; i < l; i++) {
                    let pos = c.position.clone();
                    pos.x += Math.random() * 4 - 2;
                    pos.z += Math.random() * 4 - 2;
                    setTimeout(
                        () => {
                            this.main.bonusGenerator.popBonus(pos);
                        },
                        counter * 250
                    );
                    counter++;
                }
            }
        )
        this.pendingCells = [];
    }

    private _rejectPendingCells(): void {
        TipsGenerator.ShowRandomBad();
        this.main.badSound.play();
        this.pendingCells.forEach(
            (c) => {
                c.setWrongState();
                setTimeout(
                    () => {
                        c.kill();
                    },
                    3000
                );
            }
        )
        this.pendingCells = [];
    }
}