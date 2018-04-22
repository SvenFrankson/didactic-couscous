class Shot {

    private _instance: BABYLON.AbstractMesh;

    public get generator(): InvaderGenerator {
        return this.main.invaderGenerator;
    }

    constructor(
        public playerShot: boolean,
        public position: BABYLON.Vector3,
        public direction: BABYLON.Vector3,
        public speed: number,
        public damage: number,
        public range: number,
        public main: Main
    ) {
        this._instance = BABYLON.MeshBuilder.CreateBox("Shot", {size: 0.25}, main.scene);
        this._instance.position.copyFrom(position);
        if (playerShot) {
            this.main.scene.onBeforeRenderObservable.add(this._playerShotUpdate);
        }
    }

    public dispose(): void {
        this.main.scene.onBeforeRenderObservable.removeCallback(this._playerShotUpdate);
        this._instance.dispose();
    }

    private _playerShotUpdate = () => {
        let deltaTime = this.main.engine.getDeltaTime() / 1000;
        this._instance.position.addInPlace(this.direction.scale(this.speed * deltaTime));
        if (
            this.position.x < -64 ||
            this.position.x > LetterGrid.GRID_DISTANCE + 64 ||
            this.position.z < -64 ||
            this.position.z > LetterGrid.GRID_DISTANCE + 64
        ) {
            this.dispose();
            return;
        }
        for (let i = 0; i < this.generator.invaders.length; i++) {
            let invader = this.generator.invaders[i];
            if (BABYLON.Vector3.DistanceSquared(this._instance.position, invader.position) < 4) {
                invader.kill();
                this.dispose();
                return
            }
        }
    }
}