from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials, firestore, auth

app = Flask(__name__)
CORS(app)
BASE_DIR = Path(__file__).resolve().parent

cred = credentials.Certificate(BASE_DIR / "firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_current_user():
    token = request.headers.get("Authorization", "").strip()

    if not token:
        return None
    
    if token.lower().startswith("bearer "):
        token = token[7:].strip()

    try:
        return auth.verify_id_token(token)
    except Exception:
        return None

def load_data():
    doc = db.collection("tournament").document("data").get()

    if not doc.exists:
        return {}

    return doc.to_dict()

def get_user_prediction(uid):
    prediction_ref = db.collection("leaderboard").document(uid)
    prediction = prediction_ref.get()

    if prediction.exists:
        return prediction_ref, prediction

    legacy_predictions = (
        db.collection("leaderboard")
        .where("uid", "==", uid)
        .limit(1)
        .stream()
    )

    legacy_prediction = next(legacy_predictions, None)
    return prediction_ref, legacy_prediction

STAGE_POINTS = {
    "m1": 30,
    "m2": 30,
    "m3": 30,
    "m4": 30,
    "m5": 30,
    "m6": 30,
    "m7": 30,
    "m8": 30,

    "qf1": 50,
    "qf2": 50,
    "qf3": 50,
    "qf4": 50,

    "sf1": 70,
    "sf2": 70,

    "final": 100
}

STAGE_LOOKUPS = {
    "m1": ("round_of_16", 0),
    "m2": ("round_of_16", 1),
    "m3": ("round_of_16", 2),
    "m4": ("round_of_16", 3),
    "m5": ("round_of_16", 4),
    "m6": ("round_of_16", 5),
    "m7": ("round_of_16", 6),
    "m8": ("round_of_16", 7),

    "qf1": ("quarter_finals", 0),
    "qf2": ("quarter_finals", 1),
    "qf3": ("quarter_finals", 2),
    "qf4": ("quarter_finals", 3),

    "sf1": ("semi_finals", 0),
    "sf2": ("semi_finals", 1),

    "final": ("final", 0)
}


def calculate_score(selections, data):
    total = 0
    results = {}

    for stage, points in STAGE_POINTS.items():
        choice = selections.get(stage)

        if not choice:
            results[stage] = {
                "choice": None,
                "expected": None,
                "correct": False,
                "points": 0
            }
            continue

        lookup = STAGE_LOOKUPS[stage]
        matches = data.get(lookup[0], [])

        if lookup[1] >= len(matches):
            return None, None, f"Missing tournament data for {stage}"

        match = matches[lookup[1]]
        expected = match.get("winner")
        valid_teams = [match.get("team1"), match.get("team2")]

        correct = choice in valid_teams and choice == expected
        earned = points if correct else 0
        total += earned

        results[stage] = {
            "choice": choice,
            "expected": expected,
            "correct": correct,
            "points": earned
        }

    return total, results, None

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "login.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(BASE_DIR, path)

@app.route("/api/data")
def api_data():
    data = load_data()

    if not data:
        return jsonify({"error": "Tournament data not found"}), 404

    return jsonify(data)

@app.route("/predict", methods=["POST"])
def predict():
    req_data = request.get_json(silent=True) or {}
    selections = req_data.get("selections")

    if not isinstance(selections, dict):
        return jsonify({"error": "Selections must be an object"}), 400

    missing = [
        stage for stage in STAGE_POINTS
        if not selections.get(stage)
    ]

    if missing:
        return jsonify({
            "error": "Complete all predictions before submitting",
            "missing": missing
        }), 400

    data = load_data()

    if not data:
        return jsonify({"error": "Tournament data not found"}), 500

    total_points, results, error = calculate_score(selections, data)

    if error:
        return jsonify({"error": error}), 500

    user = get_current_user()
    if not user:
        return jsonify({"error": "Log in before submitting your bracket"}), 401

    prediction_ref, existing_prediction = get_user_prediction(user["uid"])
    if existing_prediction is not None and existing_prediction.exists:
        return jsonify({
            "error": "This bracket has already been submitted and cannot be changed"
        }), 409

    email = user.get("email")
    player_name = str(
        user.get("name") or
        (email.split("@")[0] if email else "Anonymous")
    ).strip()[:50]

    if not player_name:
        player_name = "Anonymous"

    entry = {
        "player_name": player_name,
        "score": total_points,
        "selections": selections,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uid": user.get("uid"),
        "email": email
    }

    try:
        prediction_ref.set(entry)
    except Exception as error:
        print("Leaderboard save error:", error)
        return jsonify({"error": "Could not save score to leaderboard"}), 500

    return jsonify({
        "message": "Bracket submitted successfully",
        "total_points": total_points,
        "results": results,
        "player_name": player_name
    }), 201


@app.route("/my-prediction", methods=["GET"])
def get_my_prediction():
    user = get_current_user()

    if not user:
        return jsonify({"error": "Log in before viewing your prediction"}), 401

    try:
        _, doc = get_user_prediction(user["uid"])

        if doc is None or not doc.exists:
            return jsonify({"submitted": False, "prediction": None})

        return jsonify({
            "submitted": True,
            "prediction": doc.to_dict()
        })
    except Exception as error:
        print("Saved prediction error:", error)
        return jsonify({"error": "Could not load your saved prediction"}), 500

@app.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    try:
        docs = (
            db.collection("leaderboard")
            .order_by("score", direction=firestore.Query.DESCENDING)
            .limit(100)
            .stream()
        )

        leaderboard = []

        for rank, doc in enumerate(docs, start=1):
            item = doc.to_dict()

            item.pop("uid", None)
            item.pop("email", None)

            item["id"] = doc.id
            item["rank"] = rank
            leaderboard.append(item)

        return jsonify({"leaderboard": leaderboard})

    except Exception as error:
        print("Leaderboard error:", error)
        return jsonify({"error": "Could not load leaderboard"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)