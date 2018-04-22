class Bonus extends BABYLON.Mesh {

    constructor(name: string, public main: Main) {
        super(name, main.scene);
    }

    public catch(): void {

    }
}