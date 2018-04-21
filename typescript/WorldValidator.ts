class WordValidator {

    public static readonly MAX_WORD_LENGTH: number = 4;
    private _words: string[][] = [];

    constructor() {

    }

    public initialize() {
        this._words = [];
        for (let i = 2; i <= WordValidator.MAX_WORD_LENGTH; i++) {
            $.get(
                "dictionnary/en/" + i + ".txt",
                (data: string) => {
                    this._words[i] = data.split(" ");
                    console.log("Words in " + i + " letters : " + this._words[i].length);
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
            console.log("Check word " + word);
            console.log("In " + words.length + " words");
            return words.indexOf(word.toLowerCase()) !== -1;
        }
    }
}