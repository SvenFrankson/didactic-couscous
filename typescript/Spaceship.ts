class Spaceship extends BABYLON.Mesh {

    private _instance: BABYLON.Mesh;
    public straff: number = 0;
    public thrust: number = 0;
    public _hitPoints: number = 100;
    public get hitPoints(): number {
        return this._hitPoints;
    }
    public set hitPoints(v: number) {
        this._hitPoints = Math.round(v);
        if (this._hitPoints > this.stamina) {
            this._hitPoints = Math.round(this.stamina);
        }
    }

    private _score: number = 0;
    public get score(): number {
        return this._score;
    }
    public set score(v: number) {
        this._score = Math.round(v);
        this._updateUI();
    }
    public kills: number = 0;
    public xp: number = 0;
    public words: number = 0;
    public regenCooldown: number = 60;
    public regenDelay: number = 180;
    public mouseInput: SpaceshipMouseInput;
    private _keyboardInput: SpaceshipKeyboardInput;
    public letterStack: LetterStack;
    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public scoreUI: BABYLON.GUI.TextBlock;
    public hpUI: BABYLON.GUI.TextBlock;
    public staminaTextUI: BABYLON.GUI.TextBlock;
    public shieldTextUI: BABYLON.GUI.TextBlock;
    public powerTextUI: BABYLON.GUI.TextBlock;
    public firerateTextUI: BABYLON.GUI.TextBlock;

    private _staminaXp: number = 0;
    public upStamina(): void {
        this.xp++;
        this._staminaXp++;
        this.hitPoints++;
        if (this._staminaXp > this.staminaLevel) {
            this.score += this.staminaLevel * 5;
            this.main.upgradeSound.play();
            this.staminaLevel++;
            this.regenCooldown--;
            this.staminaCoef = Math.pow(1.1, this.staminaLevel);
            this._staminaXp = 0;
            this._updateUI();
        }
    }
    private _shieldXp: number = 0;
    public upShield(): void {
        this.xp++;
        this._shieldXp++;
        this.hitPoints++;
        if (this._shieldXp > this.shieldLevel) {
            this.score += this.shieldLevel * 5;
            this.main.upgradeSound.play();
            this.shieldLevel++;
            this.shieldCoef = Math.pow(1.1, this.shieldLevel);
            this._shieldXp = 0;
            this._updateUI();
        }
    }
    private _powerXp: number = 0;
    public upPower(): void {
        this.xp++;
        this._powerXp++;
        this.hitPoints++;
        if (this._powerXp > this.powerLevel) {
            this.score += this.powerLevel * 5;
            this.main.upgradeSound.play();
            this.powerLevel++;
            this.powerCoef = Math.pow(1.1, this.powerLevel);
            this._powerXp = 0;
            this._updateUI();
        }
    }
    private _firerateXp: number = 0;
    public upFirerate(): void {
        this.xp++;
        this._firerateXp++;
        this.hitPoints++;
        if (this._firerateXp > this.firerateLevel) {
            this.score += this.firerateLevel * 5;
            this.main.upgradeSound.play();
            this.firerateLevel++;
            this.firerateCoef = Math.pow(1.1, this.firerateLevel);
            this._firerateXp = 0;
            this._updateUI();
        }
    }

    public staminaLevel: number = 0;
    public shieldLevel: number = 0;
    public powerLevel: number = 0;
    public firerateLevel: number = 0;
    
    public staminaCoef: number = 1;
    public shieldCoef: number = 1;
    public powerCoef: number = 1;
    public firerateCoef: number = 1;

    public get stamina(): number {
        return Math.floor(100 * this.staminaCoef);
    }
    public get shield(): number {
        return 10 * this.shieldCoef;
    }
    public get power(): number {
        return 10 * this.powerCoef;
    }
    public get firerate(): number {
        return 2 * this.firerateCoef;
    }

    public get grid(): LetterGrid {
        return this.main.grid;
    }
    public get gui(): BABYLON.GUI.AdvancedDynamicTexture {
        return this.main.gui;
    }

    constructor(
        public main: Main
    ) {
        super("Spaceship", main.scene);
        BABYLON.SceneLoader.ImportMesh(
			"",
			"./models/spaceship.babylon",
			"",
            this.getScene(),
            (meshes) => {
                if (meshes[0]) {
                    meshes[0].parent = this;
                }
            }
        );
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.mouseInput = new SpaceshipMouseInput(this);
        this._keyboardInput = new SpaceshipKeyboardInput(this);
        this.getScene().onBeforeRenderObservable.add(this._update);
        this.letterStack = new LetterStack(this.main);
        this._createUI();
    }

    private _createUI(): void {

        let leftSideUI = new BABYLON.GUI.Image("leftSideUI", "textures/left_side_ui.png");
        leftSideUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        leftSideUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        leftSideUI.left = "0px";
        leftSideUI.top = "-75px";
        leftSideUI.width = "475px";
        leftSideUI.height = "950px";
        this.gui.addControl(leftSideUI);

        this.scoreUI = new BABYLON.GUI.TextBlock("ScoreBlock", "SCORE " + this.score);
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

        this.hpUI = new BABYLON.GUI.TextBlock("ScoreBlock", "HP " + this.hitPoints + " / " + this.stamina);
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
        staminaIcon.left = "-200 px";
        staminaIcon.top = (-160 - 80) + " px";
        staminaIcon.width = "128px";
        staminaIcon.height = "128px";
        this.gui.addControl(staminaIcon);
        
        let shieldIcon = new BABYLON.GUI.Image("ShieldIcon", "textures/shield_icon.png");
        shieldIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        shieldIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shieldIcon.left = "-200 px";
        shieldIcon.top = (- 80) + " px";
        shieldIcon.width = "128px";
        shieldIcon.height = "128px";
        this.gui.addControl(shieldIcon);
        
        let powerIcon = new BABYLON.GUI.Image("PowerIcon", "textures/power_icon.png");
        powerIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        powerIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        powerIcon.left = "-200 px";
        powerIcon.top = (80) + " px";
        powerIcon.width = "128px";
        powerIcon.height = "128px";
        this.gui.addControl(powerIcon);
        
        let firerateIcon = new BABYLON.GUI.Image("firerateIcon", "textures/firerate_icon.png");
        firerateIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        firerateIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        firerateIcon.left = "-200 px";
        firerateIcon.top = (80 + 160) + " px";
        firerateIcon.width = "128px";
        firerateIcon.height = "128px";
        this.gui.addControl(firerateIcon);

        let staminaTitleUI = new BABYLON.GUI.TextBlock("staminaTextUI", "STAMINA");
        staminaTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        staminaTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        staminaTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        staminaTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        staminaTitleUI.left = "-40 px";
        staminaTitleUI.top = (-160 - 80 - 48) + " px";
        staminaTitleUI.width = "160px";
        staminaTitleUI.height = "64px";
        staminaTitleUI.fontSize = "30px";
        staminaTitleUI.fontFamily = "Komikax";
        staminaTitleUI.color = "white";
        this.gui.addControl(staminaTitleUI);

        let shieldTitleUI = new BABYLON.GUI.TextBlock("shieldTitleUI", "SHIELD");
        shieldTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        shieldTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shieldTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        shieldTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shieldTitleUI.left = "-40 px";
        shieldTitleUI.top = (- 80 - 48) + " px";
        shieldTitleUI.width = "160px";
        shieldTitleUI.height = "64px";
        shieldTitleUI.fontSize = "30px";
        shieldTitleUI.fontFamily = "Komikax";
        shieldTitleUI.color = "white";
        this.gui.addControl(shieldTitleUI);

        let powerTitleUI = new BABYLON.GUI.TextBlock("powerTitleUI", "POWER");
        powerTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        powerTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        powerTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        powerTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        powerTitleUI.left = "-40 px";
        powerTitleUI.top = (80 - 48) + " px";
        powerTitleUI.width = "160px";
        powerTitleUI.height = "64px";
        powerTitleUI.fontSize = "30px";
        powerTitleUI.fontFamily = "Komikax";
        powerTitleUI.color = "white";
        this.gui.addControl(powerTitleUI);

        let firerateTitleUI = new BABYLON.GUI.TextBlock("firerateTitleUI", "FIRERATE");
        firerateTitleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        firerateTitleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        firerateTitleUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        firerateTitleUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        firerateTitleUI.left = "-40 px";
        firerateTitleUI.top = (160 + 80 - 48) + " px";
        firerateTitleUI.width = "160px";
        firerateTitleUI.height = "64px";
        firerateTitleUI.fontSize = "30px";
        firerateTitleUI.fontFamily = "Komikax";
        firerateTitleUI.color = "white";
        this.gui.addControl(firerateTitleUI);

        this.staminaTextUI = new BABYLON.GUI.TextBlock("staminaTextUI", "LvL 1");
        this.staminaTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.staminaTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.staminaTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.staminaTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.staminaTextUI.left = "-40 px";
        this.staminaTextUI.top = (-160 - 80) + " px";
        this.staminaTextUI.width = "128px";
        this.staminaTextUI.height = "64px";
        this.staminaTextUI.fontSize = "40px";
        this.staminaTextUI.color = "white";
        this.gui.addControl(this.staminaTextUI);

        this.shieldTextUI = new BABYLON.GUI.TextBlock("shieldTextUI", "LvL 1");
        this.shieldTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.shieldTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.shieldTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.shieldTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.shieldTextUI.left = "-40 px";
        this.shieldTextUI.top = (- 80) + " px";
        this.shieldTextUI.width = "128px";
        this.shieldTextUI.height = "64px";
        this.shieldTextUI.fontSize = "40px";
        this.shieldTextUI.color = "white";
        this.gui.addControl(this.shieldTextUI);

        this.powerTextUI = new BABYLON.GUI.TextBlock("powerTextUI", "LvL 1");
        this.powerTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.powerTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.powerTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.powerTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.powerTextUI.left = "-40 px";
        this.powerTextUI.top = (80) + " px";
        this.powerTextUI.width = "128px";
        this.powerTextUI.height = "64px";
        this.powerTextUI.fontSize = "40px";
        this.powerTextUI.color = "white";
        this.gui.addControl(this.powerTextUI);

        this.firerateTextUI = new BABYLON.GUI.TextBlock("firerateTextUI", "LvL 1");
        this.firerateTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.firerateTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.firerateTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.firerateTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.firerateTextUI.left = "-40 px";
        this.firerateTextUI.top = (80 + 160) + " px";
        this.firerateTextUI.width = "128px";
        this.firerateTextUI.height = "64px";
        this.firerateTextUI.fontSize = "40px";
        this.firerateTextUI.color = "white";
        this.gui.addControl(this.firerateTextUI);

        this._updateUI();
    }

    private _updateUI() {
        this.hpUI.text = "HP " + this.hitPoints + " / " + this.stamina;
        this.scoreUI.text = "SCORE " + this.score;
        this.staminaTextUI.text = "lvl " + this.staminaLevel;
        this.shieldTextUI.text = "lvl " + this.shieldLevel;
        this.powerTextUI.text = "lvl " + this.powerLevel;
        this.firerateTextUI.text = "lvl " + this.firerateLevel;
    }

    private _update = () => {
        if (this._coolDown > 0) {
            this._coolDown--;
        }
        this._regenDelayTimer--;
        if (this._regenDelayTimer <= 0) {
            this._regenTimer--;
            if (this._regenTimer <= 0) {
                this.hitPoints += 1;
                this._regenTimer = this.regenCooldown;
                this._updateUI();
            }
        }
        let deltaTime = this.getEngine().getDeltaTime() / 1000;
        if (Main.MOUSE_ONLY_CONTROL || Main.KEYBOARD_LOCAL_CONTROL) {
            this.velocity.addInPlace(
                this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime)
            );
            this.velocity.addInPlace(
                this.getDirection(BABYLON.Axis.X).scale(this.straff * deltaTime)
            );
        }
        else {
            this.velocity.z += this.thrust * deltaTime;
            this.velocity.x += this.straff * deltaTime;
        }
        let dragX = this.getDirection(BABYLON.Axis.X);
        let dragXComp = BABYLON.Vector3.Dot(this.velocity, dragX);
        dragXComp *= Math.abs(dragXComp);
        dragX.scaleInPlace(dragXComp * deltaTime * 0.1);
        let dragZ = this.getDirection(BABYLON.Axis.Z);
        let dragZComp = BABYLON.Vector3.Dot(this.velocity, dragZ);
        if (dragZComp < 0) {
            dragZComp *= 5;
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
    }
    
    private _coolDown: number = 0;
    public shoot(): void {
        if (this._coolDown > 0) {
            return;
        }
        new Shot(
            true,
            this.position,
            this.rotationQuaternion,
            20,
            this.power,
            100,
            this.main
        );
        this._coolDown = Math.round(60 / this.firerate);
    }

    private _regenTimer: number = 0;
    private _regenDelayTimer: number = 0;
    public wound(damage: number): void {
        this._regenDelayTimer = this.regenDelay;
        this._regenTimer = this.regenCooldown;
        let r = Math.random();
        if (r < this.shield / 100) {
            return;
        }
        this.hitPoints -= damage;
        if (this.hitPoints <= 0) {
            setTimeout(
                () => {
                    this.getChildMeshes().forEach(
                        (m) => {
                            m.isVisible = false;
                        }
                    )
                    Main.GameOver();
                },
                250
            );
        }
        this._updateUI();
    }
}