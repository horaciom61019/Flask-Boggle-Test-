from flask import Flask, jsonify, request, render_template, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

app = Flask(__name__)
app.config['SECRET_KEY'] = "secret" 
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
debug = DebugToolbarExtension(app)

boggle_game = Boggle()

@app.route("/")
def home():
    """ Show board"""

    board = boggle_game.make_board()
    session["board"] = board

    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    return render_template("index.html", board=board, highscore=highscore, nplays=nplays)


@app.route("/check_word")
def check_word():
    """ Check if word is in Dict """

    word = request.args["word"]
    board = session["board"]
    response = boggle_game.check_valid_word(board, word)

    return jsonify({'result' : response})


@app.route("/post-score", methods=["POST"])
def post_score():
    """Receive score, update nplays, update high score if new."""

    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    session['nplays'] = nplays + 1
    session['highscore'] = max(score, highscore)

    return jsonify(highestRecord=score > highscore)