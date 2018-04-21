class LetterCell extends BABYLON.Mesh{

    constructor(
        public letter: string,
        public i: number,
        public j: number,
        public grid: LetterGrid
    ) {
        super("LetterCell-" + i + "-" + j, grid.scene);
        console.log("New Cell " + i + "_" +  j);
        let instance = BABYLON.MeshBuilder.CreateGround(
            this.name + "_mesh",
            {
                width: LetterGrid.GRID_SIZE * 0.9,
                height: LetterGrid.GRID_SIZE * 0.9
            },
            this.getScene()
        );
        instance.position.x = i * LetterGrid.GRID_SIZE;
        instance.position.z = j * LetterGrid.GRID_SIZE;
        console.log(instance.position);
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
    public grid: string[][];

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    constructor(
        public main: Main
    ) {
        this.grid = [];
    }

    public worldToGrid(world: BABYLON.Vector3): BABYLON.Vector2 {
        let gridPosition = BABYLON.Vector2.Zero();
        gridPosition.x = Math.floor(world.x / LetterGrid.GRID_SIZE);
        gridPosition.y = Math.floor(world.z / LetterGrid.GRID_SIZE);
        return gridPosition;
    }

    public add(l: string, world: BABYLON.Vector3) {
        console.log(world);
        let gridPosition = this.worldToGrid(world);
        if (gridPosition.x >= 0 && gridPosition.x < LetterGrid.GRID_LENGTH) {
            if (gridPosition.y >= 0 && gridPosition.y < LetterGrid.GRID_LENGTH) {
                let i = Math.floor(gridPosition.x);
                let j = Math.floor(gridPosition.y);
                if (!this.grid[i]) {
                    this.grid[i] = [];
                }
                if (!this.grid[i][j]) {
                    this.grid[i][j] = "l";
                    new LetterCell(l, i, j, this);
                }
            }
        }
    }
}