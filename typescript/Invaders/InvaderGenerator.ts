class InvaderGenerator {

    public invaders: Invader[];

    public playerRange: number = 100;
    public invaderRate: number = 5000;

    public get grid(): LetterGrid {
        return this.main.grid;
    }
    public get spaceship(): Spaceship {
        return this.main.spaceship;
    }

    constructor(public main: Main) {
        this.invaders = [];
    }

    public start(): void {
        this._popInvader();
    }

    private _popInvader(): void {
        let invader = new Invader(this.main);
        this.invaders.push(invader);
        let minX = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxX = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.x + this.playerRange);
        let minZ = Math.max(0, this.spaceship.position.x - this.playerRange);
        let maxZ = Math.min(LetterGrid.GRID_DISTANCE, this.spaceship.position.z + this.playerRange);
        invader.position.x = Math.random() * (maxX - minX) + minX;
        invader.position.z = Math.random() * (maxZ - minZ) + minZ;
        setTimeout(
            () => {
                this._popInvader();
            },
            Math.random() * this.invaderRate * 1.5
        );
    }
}