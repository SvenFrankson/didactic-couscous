class InvaderGenerator {

    public invaders: Invader[];

    public playerRange: number = 100;
    public invaderRate: number = 10000;

    public invaderLevelTime: number = 60;
    public invaderLevel: number = 1;

    public invaderLevelUpWarning: BABYLON.Mesh;
    public invaderLevelUpWarningText: BABYLON.GUI.TextBlock;

    public get grid(): LetterGrid {
        return this.main.grid;
    }
    public get spaceship(): Spaceship {
        return this.main.spaceship;
    }

    constructor(public main: Main) {
        this.invaders = [];
        this.invaderLevelUpWarning = BABYLON.MeshBuilder.CreateGround(
            "invaderLevelUpWarning",
            {
                width: 50,
                height: 50
            },
            this.main.scene
        );
        let invaderLevelUpWarningTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.invaderLevelUpWarning);
        this.invaderLevelUpWarningText = new BABYLON.GUI.TextBlock("invaderLevelUpWarningText", "INVADERS ARE GETTING STRONGER !");
        this.invaderLevelUpWarningText.color = "white";
        this.invaderLevelUpWarningText.fontSize = "50";
        invaderLevelUpWarningTexture.addControl(this.invaderLevelUpWarningText);
        this.invaderLevelUpWarning.isVisible = false;
    }

    public start(): void {
        this._popInvader();
        this.main.scene.onBeforeRenderObservable.add(this._updateInvadersLevel);
    }

    private timer: number = 0;
    private _updateInvadersLevel = () => {
        this.timer += this.main.engine.getDeltaTime() / 1000;
        if (this.timer > this.invaderLevelTime) {
            this.timer = 0;
            if (Math.random() > 0.5) {
                this.invaderLevelUpWarningText.text = "INVADERS ARE GETTING STRONGER !";
                this.invaderLevel *= 1.1;
            } else {
                this.invaderLevelUpWarningText.text = "INVADERS ARE CALLING BACKUPS !";
                this.invaderRate /= 1.1;
            }
            this.invaderLevelUpWarning.position.copyFrom(this.main.spaceship.position);
            this.invaderLevelUpWarning.position.y = -1;
            this.invaderLevelUpWarning.position.z -= 5;
            this._k = 0;
            this.invaderLevelUpWarning.isVisible = true;
            this.invaderLevelUpWarning.scaling.copyFromFloats(0, 0, 0);
            this.main.scene.onBeforeRenderObservable.add(this._flashAlert);
        }
    }

    private _k: number = 0;
    private _flashAlert = () => {
        this._k ++;
        let size = Math.sqrt(BABYLON.Scalar.Clamp(this._k / 120, 0, 1));
        this.invaderLevelUpWarning.scaling.copyFromFloats(
            size, size, size
        );
        if (this._k > 120) {
            this.invaderLevelUpWarning.isVisible = false;
            this.main.scene.onBeforeRenderObservable.removeCallback(this._flashAlert);
        }
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