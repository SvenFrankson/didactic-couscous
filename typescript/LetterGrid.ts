class LetterCell extends BABYLON.Mesh{

    constructor(
        public letter: string,
        public i: number,
        public j: number,
        public grid: LetterGrid
    ) {
        super("LetterCell-" + i + "-" + j, grid.scene);
        let instance = BABYLON.MeshBuilder.CreateGround(
            this.name + "_mesh",
            {
                width: LetterGrid.GRID_SIZE * 0.9,
                height: LetterGrid.GRID_SIZE * 0.9
            },
            this.getScene()
        );
        instance.position.x = (i + 0.5) * LetterGrid.GRID_SIZE;
        instance.position.z = (j + 0.5) * LetterGrid.GRID_SIZE;
        let texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(instance);
        let l = new BABYLON.GUI.TextBlock("l", this.letter);
        l.fontSize = 1000;
        l.color = "white";
        texture.addControl(l);
    }
}

class LetterGrid {

    public static readonly GRID_LENGTH: number = 128;
    public static readonly GRID_SIZE: number = 4;
    public grid: LetterCell[][];

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    constructor(
        public main: Main
    ) {
        this.grid = [];
        this.initialize();
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
                    this.grid[i][j] = new LetterCell(l, i, j, this);
                }
            }
        }
    }
}