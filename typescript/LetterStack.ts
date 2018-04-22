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
        this._letterUISlots = [];
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            let textIcon = new BABYLON.GUI.Image("TextIcon-" + i, "textures/letter_icon.png");
            textIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            textIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            textIcon.left = (20 + (100 + 10) * i) + " px";
            textIcon.top = "20 px";
            textIcon.width = "100px";
            textIcon.height = "100px";
            this.gui.addControl(textIcon);

            let text = new BABYLON.GUI.TextBlock("TextBlock-" + i, "_");
            text.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            text.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            text.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            text.left = (20 + (100 + 10) * i) + " px";
            text.top = "20 px";
            text.width = "100px";
            text.height = "100px";
            text.fontSize = "50px";
            text.color = "black";
            this._letterUISlots[i] = text;
            this.gui.addControl(text);

            let index = new BABYLON.GUI.TextBlock("IndexBlock-" + i, "(" + (i + 1) + ")");
            index.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            index.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            index.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            index.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            index.left = (20 + (100 + 10) * i) + " px";
            index.top = "130 px";
            index.width = "100px";
            index.height = "100px";
            index.fontSize = "20px";
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
        for (let i = 0;  i< LetterStack.MAX_LENGTH; i++) {
            if (!this.letters[i]) {
                this.letters[i] = l;
                this._updateUI();
                return;
            }
        }
    }

    public removeAt(n: number) {
        let l = "";
        if (this.letters[n]) {
            l = this.letters[n];
            this.letters[n] = "";
        }
        this._updateUI();
        return l;
    }
}