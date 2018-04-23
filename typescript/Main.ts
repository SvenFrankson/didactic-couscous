class Main {

	public static LANGUAGE: string = "en";
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

	public static musicSound: HTMLAudioElement;
	public greenLaserSound: BABYLON.Sound;
	public blueLaserSound: BABYLON.Sound;
	public redLaserSound: BABYLON.Sound;
	public purpleLaserSound: BABYLON.Sound;
	public upgradeSound: BABYLON.Sound;
	public goodSound: BABYLON.Sound;
	public badSound: BABYLON.Sound;

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
		this.gui.idealHeight = 1217;

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

		this.greenLaserSound = new BABYLON.Sound("greenLaserSound", "sounds/laser-shot-1.wav", Main.instance.scene);
		this.blueLaserSound = new BABYLON.Sound("blueLaserSound", "sounds/laser-shot-2.wav", Main.instance.scene);
		this.redLaserSound = new BABYLON.Sound("redLaserSound", "sounds/laser-shot-3.wav", Main.instance.scene);
		this.purpleLaserSound = new BABYLON.Sound("purpleLaserSound", "sounds/laser-shot-4.wav", Main.instance.scene);
		this.goodSound = new BABYLON.Sound("purpleLaserSound", "sounds/good.wav", Main.instance.scene);
		this.badSound = new BABYLON.Sound("purpleLaserSound", "sounds/bad.wav", Main.instance.scene);
		this.upgradeSound = new BABYLON.Sound("purpleLaserSound", "sounds/upgrade.wav", Main.instance.scene);

		this.grid = new LetterGrid(this);

		this.spaceship = new Spaceship(this);
		this.spaceship.position.copyFromFloats(30, 0, 30);

		let camera = new SpaceshipCamera(this.spaceship);

		this.wordValidator = new WordValidator();
		this.wordValidator.initialize();

		this.bonusGenerator = new BonusGenerator(this);
		this.bonusGenerator.start();

		this.invaderGenerator = new InvaderGenerator(this);
		setTimeout(
			() => {
				this.invaderGenerator.start();
			},
			5000
		);
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
		setTimeout(
			() => {
				TipsGenerator.ShowRandomTips();
			},
			1000
		);
	}

	public static GameOver(): void {
		Main.instance.invaderGenerator.invaders.forEach(
			(i) => {
				i.kill();
			}
		)
		Main.instance.gui.dispose();
		Main.instance.bonusGenerator.stop();
		Main.instance.invaderGenerator.stop();
		$("#score").text("SCORE " + Main.instance.spaceship.score);
		$("#kills").text("KILLS " + Main.instance.spaceship.kills);
		$("#words").text("WORDS " + Main.instance.spaceship.words);
		$("#experience").text("EXPERIENCE " + Main.instance.spaceship.xp);
		$(".main-menu").hide();
		$(".game-over").show();
	}
}

window.addEventListener("DOMContentLoaded", () => {

	Main.musicSound = new Audio();
    Main.musicSound.src = "sounds/music.wav";
	Main.musicSound.play();
	Main.musicSound.loop = true;

	$("#play-fr").on("click", () => {
		Main.LANGUAGE = "fr";
		Main.Play();
	});
	$("#play-en").on("click", () => {
		Main.LANGUAGE = "en";
		Main.Play();
	});
	$("#easy").on("click", () => {
		InvaderGenerator.invaderLevelTime = 70;
		InvaderGenerator.invaderRate = 10000;
		$(".level").css("color", "grey");
		$(".level").css("background", "none");
		$("#easy").css("color", "black");
		$("#easy").css("background", "white");
	});
	$("#medium").on("click", () => {
		InvaderGenerator.invaderLevelTime = 60;
		InvaderGenerator.invaderRate = 8000;
		$(".level").css("color", "grey");
		$(".level").css("background", "none");
		$("#medium").css("color", "black");
		$("#medium").css("background", "white");
	});
	$("#hard").on("click", () => {
		InvaderGenerator.invaderLevelTime = 50;
		InvaderGenerator.invaderRate = 6000;
		$(".level").css("color", "grey");
		$(".level").css("background", "none");
		$("#hard").css("color", "black");
		$("#hard").css("background", "white");
	});
	$("#stfu").on("click", () => {
		Main.musicSound.pause();
		$("#stfu").hide();
		$("#kill-my-ears").show();
	})
	$("#kill-my-ears").on("click", () => {
		Main.musicSound.play();
		$("#stfu").show();
		$("#kill-my-ears").hide();
	})
})


