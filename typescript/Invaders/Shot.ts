class Shot {

    private static _greenLaserSound: BABYLON.Sound;
    public static get greenLaserSound(): BABYLON.Sound {
        if (!this._greenLaserSound) {
            this._greenLaserSound = new BABYLON.Sound("greenLaserSound", "sounds/laser-shot-1.wav", Main.instance.scene);
        }
        return this._greenLaserSound;
    }

    private static _blueLaserSound: BABYLON.Sound;
    public static get blueLaserSound(): BABYLON.Sound {
        if (!this._blueLaserSound) {
            this._blueLaserSound = new BABYLON.Sound("blueLaserSound", "sounds/laser-shot-2.wav", Main.instance.scene);
        }
        return this._blueLaserSound;
    }

    private static _redLaserSound: BABYLON.Sound;
    public static get redLaserSound(): BABYLON.Sound {
        if (!this._redLaserSound) {
            this._redLaserSound = new BABYLON.Sound("redLaserSound", "sounds/laser-shot-3.wav", Main.instance.scene);
        }
        return this._redLaserSound;
    }

    private static _purpleLaserSound: BABYLON.Sound;
    public static get purpleLaserSound(): BABYLON.Sound {
        if (!this._purpleLaserSound) {
            this._purpleLaserSound = new BABYLON.Sound("purpleLaserSound", "sounds/laser-shot-4.wav", Main.instance.scene);
        }
        return this._purpleLaserSound;
    }

    private static _greenLaserBase: BABYLON.Mesh;
    public static get greenLaserBase(): BABYLON.Mesh {
        if (!this._greenLaserBase) {
            this._greenLaserBase = BABYLON.MeshBuilder.CreateGround(
                "greenLaser",
                {
                    width: 0.3,
                    height: 1.5
                },
                Main.instance.scene
            );
            let greenLaserMaterial = new BABYLON.StandardMaterial("greenLaserMaterial", Main.instance.scene);
            greenLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/green_laser.png", Main.instance.scene);
            greenLaserMaterial.diffuseTexture.hasAlpha = true;
            greenLaserMaterial.useAlphaFromDiffuseTexture;
            this._greenLaserBase.material = greenLaserMaterial; 
        }
        return this._greenLaserBase;
    }

    private static _blueLaserBase: BABYLON.Mesh;
    public static get blueLaserBase(): BABYLON.Mesh {
        if (!this._blueLaserBase) {
            this._blueLaserBase = BABYLON.MeshBuilder.CreateGround(
                "blueLaser",
                {
                    width: 0.3,
                    height: 1.5
                },
                Main.instance.scene
            );
            let blueLaserMaterial = new BABYLON.StandardMaterial("blueLaserMaterial", Main.instance.scene);
            blueLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/blue_laser.png", Main.instance.scene);
            blueLaserMaterial.diffuseTexture.hasAlpha = true;
            blueLaserMaterial.useAlphaFromDiffuseTexture;
            this._blueLaserBase.material = blueLaserMaterial; 
        }
        return this._blueLaserBase;
    }

    private static _redLaserBase: BABYLON.Mesh;
    public static get redLaserBase(): BABYLON.Mesh {
        if (!this._redLaserBase) {
            this._redLaserBase = BABYLON.MeshBuilder.CreateGround(
                "redLaser",
                {
                    width: 0.3,
                    height: 1.5
                },
                Main.instance.scene
            );
            let redLaserMaterial = new BABYLON.StandardMaterial("redLaserMaterial", Main.instance.scene);
            redLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/red_laser.png", Main.instance.scene);
            redLaserMaterial.diffuseTexture.hasAlpha = true;
            redLaserMaterial.useAlphaFromDiffuseTexture;
            this._redLaserBase.material = redLaserMaterial; 
        }
        return this._redLaserBase;
    }

    private static _purpleLaserBase: BABYLON.Mesh;
    public static get purpleLaserBase(): BABYLON.Mesh {
        if (!this._purpleLaserBase) {
            this._purpleLaserBase = BABYLON.MeshBuilder.CreateGround(
                "purpleLaser",
                {
                    width: 0.3,
                    height: 1.5
                },
                Main.instance.scene
            );
            let purpleLaserMaterial = new BABYLON.StandardMaterial("purpleLaserMaterial", Main.instance.scene);
            purpleLaserMaterial.diffuseTexture = new BABYLON.Texture("textures/purple_laser.png", Main.instance.scene);
            purpleLaserMaterial.diffuseTexture.hasAlpha = true;
            purpleLaserMaterial.useAlphaFromDiffuseTexture;
            this._purpleLaserBase.material = purpleLaserMaterial; 
        }
        return this._purpleLaserBase;
    }

    private _instance: BABYLON.AbstractMesh;
    private _direction: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public get generator(): InvaderGenerator {
        return this.main.invaderGenerator;
    }

    constructor(
        public playerShot: boolean,
        public position: BABYLON.Vector3,
        public rotationQuaternion: BABYLON.Quaternion,
        public speed: number,
        public damage: number,
        public range: number,
        public main: Main
    ) {
        let color = Math.floor(damage / 10);
        if (color > 3) {
            this._instance = Shot.purpleLaserBase.createInstance("shotInstance");
            Shot.purpleLaserSound.play();
        } else if (color > 2) {
            this._instance = Shot.redLaserBase.createInstance("shotInstance");
            Shot.redLaserSound.play();
        } else if (color > 1) {
            this._instance = Shot.blueLaserBase.createInstance("shotInstance");
            Shot.blueLaserSound.play();
        } else {
            this._instance = Shot.greenLaserBase.createInstance("shotInstance");
            Shot.greenLaserSound.play();
        }
        let size = BABYLON.Scalar.Clamp((damage - color * 10) / 10 + 1, 1, 3);
        this._instance.position.copyFrom(position);
        this._instance.rotationQuaternion = rotationQuaternion.clone();
        this._instance.scaling.copyFromFloats(size, size, size);
        this._instance.computeWorldMatrix(true);
        this._instance.getDirectionToRef(BABYLON.Axis.Z, this._direction);
        if (playerShot) {
            this.main.scene.onBeforeRenderObservable.add(this._playerShotUpdate);
        }
        else {
            this.main.scene.onBeforeRenderObservable.add(this._invaderShotUpdate);
        }
    }

    public dispose(): void {
        this.main.scene.onBeforeRenderObservable.removeCallback(this._playerShotUpdate);
        this.main.scene.onBeforeRenderObservable.removeCallback(this._invaderShotUpdate);
        this._instance.dispose();
    }

    private _playerShotUpdate = () => {
        let deltaTime = this.main.engine.getDeltaTime() / 1000;
        this._instance.position.addInPlace(this._direction.scale(this.speed * deltaTime));
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
                invader.wound(this.damage);
                this.dispose();
                return
            }
        }
    }

    private _invaderShotUpdate = () => {
        let deltaTime = this.main.engine.getDeltaTime() / 1000;
        this._instance.position.addInPlace(this._direction.scale(this.speed * deltaTime));
        if (
            this.position.x < -64 ||
            this.position.x > LetterGrid.GRID_DISTANCE + 64 ||
            this.position.z < -64 ||
            this.position.z > LetterGrid.GRID_DISTANCE + 64
        ) {
            this.dispose();
            return;
        }
        if (BABYLON.Vector3.DistanceSquared(this._instance.position, this.main.spaceship.position) < 4) {
            this.main.spaceship.wound(this.damage);
            this.dispose();
            return
        }
    }
}