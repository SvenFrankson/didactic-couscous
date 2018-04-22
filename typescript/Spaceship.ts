class Spaceship extends BABYLON.Mesh {

    private _instance: BABYLON.Mesh;
    public thrust: number = 1;
    private _mouseInput: SpaceshipMouseInput;
    private _keyboardInput: SpaceshipKeyboardInput;
    public letterStack: LetterStack;

    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public scoreUI: BABYLON.GUI.TextBlock;
    public hpUI: BABYLON.GUI.TextBlock;
    public staminaTextUI: BABYLON.GUI.TextBlock;
    public shieldTextUI: BABYLON.GUI.TextBlock;
    public powerTextUI: BABYLON.GUI.TextBlock;
    public firerateTextUI: BABYLON.GUI.TextBlock;

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
        this._mouseInput = new SpaceshipMouseInput(this);
        this._keyboardInput = new SpaceshipKeyboardInput(this);
        this.getScene().onBeforeRenderObservable.add(this._update);
        this.letterStack = new LetterStack(this.main);
        this._createUI();
    }

    private _createUI(): void {

            this.scoreUI = new BABYLON.GUI.TextBlock("ScoreBlock", "SCORE : 0");
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

            this.hpUI = new BABYLON.GUI.TextBlock("ScoreBlock", "HP : 100");
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
            staminaIcon.left = "-20 px";
            staminaIcon.top = (-128 - 64) + " px";
            staminaIcon.width = "256px";
            staminaIcon.height = "128px";
            this.gui.addControl(staminaIcon);

            this.staminaTextUI = new BABYLON.GUI.TextBlock("staminaTextUI", "LvL 1");
            this.staminaTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.staminaTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.staminaTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.staminaTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.staminaTextUI.left = "-40 px";
            this.staminaTextUI.top = (-128 - 64) + " px";
            this.staminaTextUI.width = "128px";
            this.staminaTextUI.height = "64px";
            this.staminaTextUI.fontSize = "40px";
            this.staminaTextUI.color = "white";
            this.gui.addControl(this.staminaTextUI);
            
            let shieldIcon = new BABYLON.GUI.Image("ShieldIcon", "textures/shield_icon.png");
            shieldIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            shieldIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            shieldIcon.left = "-20 px";
            shieldIcon.top = (- 64) + " px";
            shieldIcon.width = "256px";
            shieldIcon.height = "128px";
            this.gui.addControl(shieldIcon);

            this.shieldTextUI = new BABYLON.GUI.TextBlock("shieldTextUI", "LvL 1");
            this.shieldTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.shieldTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.shieldTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.shieldTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.shieldTextUI.left = "-40 px";
            this.shieldTextUI.top = (- 64) + " px";
            this.shieldTextUI.width = "128px";
            this.shieldTextUI.height = "64px";
            this.shieldTextUI.fontSize = "40px";
            this.shieldTextUI.color = "white";
            this.gui.addControl(this.shieldTextUI);
            
            let powerIcon = new BABYLON.GUI.Image("PowerIcon", "textures/power_icon.png");
            powerIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            powerIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            powerIcon.left = "-20 px";
            powerIcon.top = (64) + " px";
            powerIcon.width = "256px";
            powerIcon.height = "128px";
            this.gui.addControl(powerIcon);

            this.powerTextUI = new BABYLON.GUI.TextBlock("powerTextUI", "LvL 1");
            this.powerTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.powerTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.powerTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.powerTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.powerTextUI.left = "-40 px";
            this.powerTextUI.top = (64) + " px";
            this.powerTextUI.width = "128px";
            this.powerTextUI.height = "64px";
            this.powerTextUI.fontSize = "40px";
            this.powerTextUI.color = "white";
            this.gui.addControl(this.powerTextUI);
            
            let firerateIcon = new BABYLON.GUI.Image("firerateIcon", "textures/firerate_icon.png");
            firerateIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            firerateIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            firerateIcon.left = "-20 px";
            firerateIcon.top = (64 + 128) + " px";
            firerateIcon.width = "256px";
            firerateIcon.height = "128px";
            this.gui.addControl(firerateIcon);

            this.firerateTextUI = new BABYLON.GUI.TextBlock("firerateTextUI", "LvL 1");
            this.firerateTextUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.firerateTextUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.firerateTextUI.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.firerateTextUI.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.firerateTextUI.left = "-40 px";
            this.firerateTextUI.top = (64 + 128) + " px";
            this.firerateTextUI.width = "128px";
            this.firerateTextUI.height = "64px";
            this.firerateTextUI.fontSize = "40px";
            this.firerateTextUI.color = "white";
            this.gui.addControl(this.firerateTextUI);
    }

    private _update = () => {
        if (this._coolDown > 0) {
            this._coolDown--;
        }
        let deltaTime = this.getEngine().getDeltaTime() / 1000;
        this.velocity.addInPlace(
            this.getDirection(BABYLON.Axis.Z).scale(this.thrust * deltaTime)
        );
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
            30,
            100,
            this.main
        );
        this._coolDown = 5;
    }
}