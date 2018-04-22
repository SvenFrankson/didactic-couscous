class Bonus extends BABYLON.Mesh {

    public loaded: boolean = false;
    
    constructor(name: string, public main: Main) {
        super(name, main.scene);
    }

    public catch(): void {

    }
}