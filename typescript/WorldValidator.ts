class WordValidator {

    public static readonly MAX_WORD_LENGTH: number = 8;
    private _words: string[][] = [];

    constructor() {

    }

    public initialize() {
        this._words = [];
        for (let i = 2; i <= WordValidator.MAX_WORD_LENGTH; i++) {
            $.get(
                "dictionnary/" + Main.LANGUAGE + "/" + i + ".txt",
                (data: string) => {
                    this._words[i] = data.split(" ");
                    for (let j = 0; j < this._words[i].length; j++) {
                        this._words[i][j] = this._words[i][j].toLowerCase();
                    }
                }
            )
        }
    }

    public isValid(word: string): boolean {
        let l = word.length;
        if (l < 2 || l > WordValidator.MAX_WORD_LENGTH) {
            return false;
        }
        else {
            let words = this._words[l];
            return words.indexOf(word.toLowerCase()) !== -1;
        }
    }

    public static lettersEN = "EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ";
    public static lettersFR = "EEEEEEEEEEEEEEEAAAAAAAAAIIIIIIIINNNNNNOOOOOORRRRRRSSSSSSTTTTTTUUUUUULLLLLDDDMMMGGBBCCPPFFHHVVJQKWXYZ";
    public static randomLetter(): string {
        if (Main.LANGUAGE === "en") {
            let r = Math.floor(Math.random() * WordValidator.lettersEN.length);
            return WordValidator.lettersEN[r];
        } else if (Main.LANGUAGE === "fr") {
            let r = Math.floor(Math.random() * WordValidator.lettersFR.length);
            return WordValidator.lettersFR[r];
        }
    }
}