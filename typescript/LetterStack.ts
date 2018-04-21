class LetterStack {

    public static readonly MAX_LENGTH: number = 7;
    public letters: string[] = [];

    public get gui(): BABYLON.GUI.AdvancedDynamicTexture {
        return this.main.gui;
    }

    constructor(public main: Main) {
        this._createUI();
        // debug fill
        this.add("T");
        this.add("E");
        this.add("S");
        this.add("T");
        this.add("O");
        this.add("S");
        this.add("T");
    }

    private _letterUISlots: BABYLON.GUI.TextBlock[];
    private _createUI(): void {
        console.log("!");
        this._letterUISlots = [];
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            let text = new BABYLON.GUI.TextBlock("TextBlock-" + i, "_");
            text.left = (0 + (100 + 10) * i - 600) + " px";
            text.top = "-500 px";
            text.width = "100 px";
            text.height = "50 px";
            text.fontSize = "30px";
            text.color = "white";
            this._letterUISlots[i] = text;
            this.gui.addControl(text);

            let index = new BABYLON.GUI.TextBlock("IndexBlock-" + i, "(" + (i + 1) + ")");
            index.left = (0 + (100 + 10) * i - 600) + " px";
            index.top = "-470 px";
            index.width = "100 px";
            index.height = "20 px";
            index.fontSize = "15px";
            index.color = "white";
            this.gui.addControl(index);
        }
    }

    private _updateUI(): void {
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            if (this.letters[i]) {
                this._letterUISlots[i].text = this.letters[i];
            }
            else {
                this._letterUISlots[i].text = "_";
            }
        }
    }

    public add(l: string) {
        if (this.letters.length < LetterStack.MAX_LENGTH) {
            this.letters.push(l);
        }
        this._updateUI();
    }

    public removeAt(n: number) {
        let l = "";
        if (this.letters[n]) {
            l = this.letters[n];
            this.letters.splice(n, 1);
        }
        this._updateUI();
        return l;
    }
}