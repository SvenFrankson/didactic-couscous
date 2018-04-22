class Main {

	public static MOUSE_ONLY_CONTROL: boolean = false;
	public static KEYBOARD_LOCAL_CONTROL: boolean = true;

	public static instance: Main;
	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
	public scene: BABYLON.Scene;
	public light: BABYLON.HemisphericLight;
	public ground: BABYLON.Mesh;
	public gui: BABYLON.GUI.AdvancedDynamicTexture;
	public grid: LetterGrid;
	public wordValidator: WordValidator;
	public bonusGenerator: BonusGenerator;
	public invaderGenerator: InvaderGenerator;
	public spaceship: Spaceship;

	constructor(canvasElement: string) {
		Main.instance = this;
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		this.engine = new BABYLON.Engine(this.canvas, true);
	}
	
	createScene(): void {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor.copyFromFloats(0, 0, 0, 0);
		this.resize();

		this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");

		let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(1, 3, 2)).normalize(), this.scene);
		light.groundColor.copyFromFloats(0.5, 0.5, 0.5);
		light.intensity = 1;

		let ratio: number =this.canvas.clientWidth /this.canvas.clientHeight;
		let height = 5;
		let width = height * ratio;
		let depth = Math.max(height, width);

		this.ground = BABYLON.MeshBuilder.CreateGround(
			"Ground",
			{
				width: LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 2,
				height: LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 2
			},
			this.scene
		);
		this.ground.position.x = LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 0.5;
		this.ground.position.y = - 0.2;
		this.ground.position.z = LetterGrid.GRID_LENGTH * LetterGrid.GRID_SIZE * 0.5;
		this.ground.isVisible = false;

		/*
		let skybox: BABYLON.Mesh = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100.0 }, this.scene);
		skybox.infiniteDistance = true;
		let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
			"skyboxes/green-nebulae",
			this.scene,
			["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skybox.material = skyboxMaterial;
		*/

		this.grid = new LetterGrid(this);

		this.spaceship = new Spaceship(this);
		this.spaceship.position.copyFromFloats(30, 0, 30);

		let camera = new SpaceshipCamera(this.spaceship);

		this.wordValidator = new WordValidator();
		this.wordValidator.initialize();

		this.bonusGenerator = new BonusGenerator(this);
		this.bonusGenerator.start();

		this.invaderGenerator = new InvaderGenerator(this);
		this.invaderGenerator.start();
	}

	public animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	public resize(): void {
		this.engine.resize();
	}

	public static Play(): void {
		$("#render-canvas").show();
		$(".main-menu").hide();
		let game: Main = new Main("render-canvas");
		game.createScene();
		game.animate();
	}
}

window.addEventListener("DOMContentLoaded", () => {
	$("#play").on("click", () => {
		Main.Play();
	})
})


