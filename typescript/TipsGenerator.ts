class TipsGenerator {

    public static randomHandle: number;

    public static Show(id: string) {
        clearTimeout(TipsGenerator.randomHandle);
        $(".tips").hide();
        $("#" + id).show();
        TipsGenerator.randomHandle = setTimeout(
            () => {
                $("#" + id).hide();
                TipsGenerator.randomHandle = setTimeout(
                    () => {
                        TipsGenerator.ShowRandomTips();
                    },
                    2000
                );
            },
            4000
        );
    }

    public static ShowRandomTips() {
        let r = Math.floor(Math.random() * 6 + 1);
        TipsGenerator.Show("tips-" + r);
    }

    public static ShowRandomGood() {
        let r = Math.floor(Math.random() * 4 + 1);
        TipsGenerator.Show("good-" + r);
    }

    public static ShowRandomBad() {
        let r = Math.floor(Math.random() * 4 + 1);
        TipsGenerator.Show("bad-" + r);
    }
}