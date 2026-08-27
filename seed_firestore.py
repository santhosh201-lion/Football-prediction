import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Bracket data
data ={
  "matches": [
    {"team1": "Manchester City", "team2": "Real Madrid", "winner": "Manchester City"},
    {"team1": "Barcelona", "team2": "Liverpool", "winner": "Liverpool"},
    {"team1": "Arsenal", "team2": "Chelsea", "winner": "Arsenal"},
    {"team1": "Manchester United", "team2": "Tottenham Hotspur", "winner": "Manchester United"},
    {"team1": "Bayern Munich", "team2": "Borussia Dortmund", "winner": "Bayern Munich"},
    {"team1": "RB Leipzig", "team2": "Bayer Leverkusen", "winner": "Bayer Leverkusen"},
    {"team1": "Paris Saint-Germain", "team2": "Olympique Marseille", "winner": "Paris Saint-Germain"},
    {"team1": "Inter Milan", "team2": "AC Milan", "winner": "Inter Milan"},
    {"team1": "Juventus", "team2": "Napoli", "winner": "Napoli"},
    {"team1": "AS Roma", "team2": "Atletico Madrid", "winner": "Atletico Madrid"},
    {"team1": "Sevilla", "team2": "Benfica", "winner": "Benfica"},
    {"team1": "Porto", "team2": "Sporting CP", "winner": "Sporting CP"},
    {"team1": "Ajax", "team2": "PSV Eindhoven", "winner": "Ajax"},
    {"team1": "Feyenoord", "team2": "Galatasaray", "winner": "Galatasaray"},
    {"team1": "Fenerbahce", "team2": "Celtic", "winner": "Celtic"},
    {"team1": "Rangers", "team2": "Club Brugge", "winner": "Rangers"}
  ],

  "round_of_16": [
    {"team1": "Manchester City", "team2": "Liverpool", "winner": "Manchester City"},
    {"team1": "Arsenal", "team2": "Manchester United", "winner": "Arsenal"},
    {"team1": "Bayern Munich", "team2": "Bayer Leverkusen", "winner": "Bayern Munich"},
    {"team1": "Paris Saint-Germain", "team2": "Inter Milan", "winner": "Inter Milan"},
    {"team1": "Napoli", "team2": "Atletico Madrid", "winner": "Atletico Madrid"},
    {"team1": "Benfica", "team2": "Sporting CP", "winner": "Benfica"},
    {"team1": "Ajax", "team2": "Galatasaray", "winner": "Ajax"},
    {"team1": "Celtic", "team2": "Rangers", "winner": "Rangers"}
  ],

  "quarter_finals": [
    {"team1": "Manchester City", "team2": "Arsenal", "winner": "Manchester City"},
    {"team1": "Bayern Munich", "team2": "Inter Milan", "winner": "Inter Milan"},
    {"team1": "Atletico Madrid", "team2": "Benfica", "winner": "Atletico Madrid"},
    {"team1": "Ajax", "team2": "Rangers", "winner": "Ajax"}
  ],

  "semi_finals": [
    {"team1": "Manchester City", "team2": "Inter Milan", "winner": "Manchester City"},
    {"team1": "Atletico Madrid", "team2": "Ajax", "winner": "Atletico Madrid"}
  ],

  "final": [
    {"team1": "Manchester City", "team2": "Atletico Madrid", "winner": "Manchester City"}
  ]
}


# Insert into Firestore
db.collection("tournament").document("data").set(data)

print("Firestore seeded successfully!")
