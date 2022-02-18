class BoggleGame {

    constructor(boardId, secs = 60) {
        this.words = new Set();
        this.board = $("#" + boardId);

        this.score = 0;

        this.secs = secs;
        this.showTimer();
        this.timer = setInterval(this.timer.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }


    /** Handles submission of word */

    async handleSubmit(evt){
        evt.preventDefault();

        // Grab word from input
        const $word = $(".word", this.board)
        let word = $word.val().toLowerCase()
        if (!word) return;

        // Let user know if word has been used
        if (this.words.has(word)) {
            this.showMessage(`Already found ${ word }`, "err")
            return
        }

        // Verify word with server
        const response = await axios.get("/check_word", { params: { word: word }});
        

        if (response.data.result === "not-word") {
            console.log(word, response.data.result)
            this.showMessage(` ${ word }, is not a valid word`, "err")
        }
        else if (response.data.result === "not-on-board"){
            console.log(word, response.data.result)
            this.showMessage(` ${ word }, is not a valid word on board`, "err")
        }
        else{
            console.log(word, response.data.result)
            this.showWord(word);
            // Score for word is equal to its length. Adds score to the total
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok");
        }

        // .focus will focus on input tag
        $word.val("").focus();
    }
    
    // Display word
    showWord(word) {
        $(".words", this.board).append($("<li>", { text: word }));
    }

    // Display messages 
    showMessage(msg, cls) {
        $(".msg", this.board)
            .text(msg)
            .removeClass()
            .addClass(`msg ${cls}`);
    }

    // Display Score
    showScore() {
        $(".score", this.board).text(this.score);
    }

    // Timer countdown
    async timer() {
        this.secs -= 1;
        this.showTimer();
    
        if (this.secs === 0) {
          clearInterval(this.timer);
          await this.scoreGame();
        }
    }

    // Display Timer
    showTimer() {
        $(".timer", this.board).text(this.secs);
    }

    // When timer ends, stop game and show score
    async scoreGame() {
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.highestRecord) {
          this.showMessage(`New record: ${this.score}`, "ok");
        } else {
          this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }
}
