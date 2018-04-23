class LetterStack {

    public static readonly MAX_LENGTH: number = 7;
    public letters: string[] = [];

    public get gui(): BABYLON.GUI.AdvancedDynamicTexture {
        return this.main.gui;
    }

    constructor(public main: Main) {
        this._createUI();
        // debug fill
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
        this.add(WordValidator.randomLetter());
    }

    private _letterUISlots: BABYLON.GUI.TextBlock[];
    private _createUI(): void {
        this._letterUISlots = [];
        for (let i = 0; i < LetterStack.MAX_LENGTH; i++) {
            let textIcon = new BABYLON.GUI.Image("TextIcon-" + i, "textures/letter_icon.png");
            textIcon.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            textIcon.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            textIcon.left = (20 + (150 + 10) * i) + " px";
            textIcon.top = "20 px";
            textIcon.width = "150px";
            textIcon.height = "150px";
            this.gui.addControl(textIcon);

            let text = new BABYLON.GUI.TextBlock("TextBlock-" + i, "_");
            text.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            text.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            text.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            text.left = (20 + (150 + 10) * i) + " px";
            text.top = "20 px";
            text.width = "150px";
            text.height = "150px";
            text.fontSize = "80px";
            text.color = "black";
            this._letterUISlots[i] = text;
            this.gui.addControl(text);
            let index = i;
            text.onPointerEnterObservable.add(
                () => {
                    this.main.spaceship.mouseInput.lockInput = true;
                }
            )
            text.onPointerOutObservable.add(
                () => {
                    this.main.spaceship.mouseInput.lockInput = false;
                }
            )
            text.onPointerDownObservable.add(
                () => {
                    this.main.spaceship.mouseInput.currentDragNDropIndex = index;
                }
            )

            let indexBlock = new BABYLON.GUI.TextBlock("indexBlock-" + i, "(" + (i + 1) + ")");
            indexBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            indexBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            indexBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            indexBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            indexBlock.left = (20 + (150 + 10) * i) + " px";
            indexBlock.top = "190 px";
            indexBlock.width = "150px";
            indexBlock.height = "150px";
            indexBlock.fontSize = "30px";
            indexBlock.color = "white";
            this.gui.addControl(indexBlock);
        }

        let langBlock = new BABYLON.GUI.TextBlock("langBlock", "(English Dictionnary)");
        langBlock.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        langBlock.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        langBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        langBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        langBlock.left = (20 + (150 + 10) * 7) + " px";
        langBlock.top = "80 px";
        langBlock.width = "400px";
        langBlock.height = "150px";
        langBlock.fontSize = "25px";
        langBlock.color = "white";
        this.gui.addControl(langBlock);

        if (Main.LANGUAGE === "en") {
            langBlock.text = "Words are validated against an\n(English Dictionnary)"
        }
        else if (Main.LANGUAGE === "fr") {
            langBlock.text = "Words are validated against a\n(French Dictionnary)"
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