class Main {

	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
	public scene: BABYLON.Scene;
	public light: BABYLON.HemisphericLight;
	public ground: BABYLON.Mesh;

	constructor(canvasElement: string) {
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		this.engine = new BABYLON.Engine(this.canvas, true);
	}
	
	createScene(): void {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor.copyFromFloats(0, 0, 0, 0);
		this.resize();

		let light = new BABYLON.HemisphericLight("Light", (new BABYLON.Vector3(0.5, 0.65, 0.8)).normalize(), this.scene);
		light.groundColor.copyFromFloats(0, 0, 0);
		light.intensity = 0.7;

		let ratio: number =this.canvas.clientWidth /this.canvas.clientHeight;
		let height = 5;
		let width = height * ratio;
		let depth = Math.max(height, width);

		let camera = new BABYLON.ArcRotateCamera("MenuCamera", 1, 1, 10, BABYLON.Vector3.Zero(), this.scene);
		camera.attachControl(this.canvas, true);

		this.ground = BABYLON.MeshBuilder.CreateGround("Ground", {width: 100, height: 100}, this.scene);
		let groundMaterial = new BABYLON.StandardMaterial("GroundMaterial", this.scene);
		groundMaterial.diffuseTexture = new BABYLON.Texture("qsdpoiqspdoiqsd", this.scene);
		this.ground.material = groundMaterial;

		let player = new Spaceship(this);
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


