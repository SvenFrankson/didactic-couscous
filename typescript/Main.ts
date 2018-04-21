class Main {

	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
	public scene: BABYLON.Scene;
	public light: BABYLON.HemisphericLight;
	public ground: BABYLON.Mesh;
	public gui: BABYLON.GUI.AdvancedDynamicTexture;
	public grid: LetterGrid;
	public wordValidator: WordValidator;

	constructor(canvasElement: string) {
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		this.engine = new BABYLON.Engine(this.canvas, true);
	}
	
	createScene(): void {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor.copyFromFloats(0, 0, 0, 0);
		this.resize();

		this.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");

		let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
		light.groundColor.copyFromFloats(0, 0, 0);
		light.intensity = 0.7;

		let ratio: number =this.canvas.clientWidth /this.canvas.clientHeight;
		let height = 5;
		let width = height * ratio;
		let depth = Math.max(height, width);

		this.ground = BABYLON.MeshBuilder.CreateGround("Ground", {width: 100, height: 100}, this.scene);
		this.ground.position.y = - 0.2;
		let groundMaterial = new BABYLON.StandardMaterial("GroundMaterial", this.scene);
		groundMaterial.diffuseTexture = new BABYLON.Texture("qsdpoiqspdoiqsd", this.scene);
		this.ground.material = groundMaterial;

		this.grid = new LetterGrid(this);

		let player = new Spaceship(this);
		player.position.copyFromFloats(30, 0, 30);

		let camera = new SpaceshipCamera(player);

		this.wordValidator = new WordValidator();
		this.wordValidator.initialize();
	}

	public animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	public resize(): void {
		this.engine.resize();
	}
}

window.addEventListener("DOMContentLoaded", () => {
	let game: Main = new Main("render-canvas");
	game.createScene();
	game.animate();
});


