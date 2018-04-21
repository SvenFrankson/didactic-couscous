class BonusGenerator {

    public instances: Bonus[];

    public playerRange: number = 100;
    public letterRate: number = 5000;

    public get grid(): LetterGrid {
        return this.main.grid;
    }
    public get spaceship(): Spaceship {
        return this.main.spaceship;
    }

    constructor(public main: Main) {
        this.instances = [];
    }

    public start(): void {
        this._popLetter();
    }

    private _popLetter(): void {
        let letter = new Letter(this.main);
        this.instances.push(letter);
        let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
        let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
        letter.position.x = Math.random() * (maxX - minX) + minX;
        letter.position.z = Math.random() * (maxZ - minZ) + minZ;
        setTimeout(
            () => {
                this._popLetter();
            },
            Math.random() * this.letterRate * 1.5
        );
    }
}