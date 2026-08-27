let bracket = {};

const STORAGE_KEY = "bracketSelections";

let selection = loadSelections();
let submitted = false;

function getStorageKey() {
    const user = auth.currentUser;
    return user ? `${STORAGE_KEY}:${user.uid}` : STORAGE_KEY;
}

const stagePoints = {
    m1: 30,
    m2: 30,
    m3: 30,
    m4: 30,
    m5: 30,
    m6: 30,
    m7: 30,
    m8: 30,

    qf1: 50,
    qf2: 50,
    qf3: 50,
    qf4: 50,

    sf1: 70,
    sf2: 70,

    final: 100
};


// -----------------------------
// LOAD SAVED SELECTIONS
// -----------------------------

function loadSelections(storageKey = STORAGE_KEY) {

    const empty = {
        m1: null,
        m2: null,
        m3: null,
        m4: null,
        m5: null,
        m6: null,
        m7: null,
        m8: null,

        qf1: null,
        qf2: null,
        qf3: null,
        qf4: null,

        sf1: null,
        sf2: null,

        final: null
    };

    try {

        const saved = JSON.parse(
            localStorage.getItem(storageKey)
        );

        if (!saved || typeof saved !== "object") {
            return empty;
        }

        return Object.fromEntries(
            Object.keys(empty).map(stage => [
                stage,
                saved[stage] || null
            ])
        );

    } catch {

        return empty;
    }
}


// -----------------------------
// SAVE SELECTIONS
// -----------------------------

function saveSelections() {

    localStorage.setItem(
        getStorageKey(),
        JSON.stringify(selection)
    );
}


// -----------------------------
// LOAD FIREBASE DATA
// -----------------------------

async function fetchBracketData() {

    try {

        const response = await fetch("/api/data");

        if (!response.ok) {
            throw new Error("Failed to load tournament data");
        }

        const data = await response.json();

        console.log("Firebase data:", data);


        // Firebase data
        const matches =
            data.round_of_16 ||
            data.matches ||
            [];

        const quarterFinals =
            data.quarter_finals ||
            [];

        const semiFinals =
            data.semi_finals ||
            [];

        const finalMatches =
            data.final ||
            [];


        bracket = {

            m1: {
                winner: matches[0]?.winner,
                points: 30
            },

            m2: {
                winner: matches[1]?.winner,
                points: 30
            },

            m3: {
                winner: matches[2]?.winner,
                points: 30
            },

            m4: {
                winner: matches[3]?.winner,
                points: 30
            },

            m5: {
                winner: matches[4]?.winner,
                points: 30
            },

            m6: {
                winner: matches[5]?.winner,
                points: 30
            },

            m7: {
                winner: matches[6]?.winner,
                points: 30
            },

            m8: {
                winner: matches[7]?.winner,
                points: 30
            },


            qf1: {
                winner: quarterFinals[0]?.winner,
                points: 50
            },

            qf2: {
                winner: quarterFinals[1]?.winner,
                points: 50
            },

            qf3: {
                winner: quarterFinals[2]?.winner,
                points: 50
            },

            qf4: {
                winner: quarterFinals[3]?.winner,
                points: 50
            },


            sf1: {
                winner: semiFinals[0]?.winner,
                points: 70
            },

            sf2: {
                winner: semiFinals[1]?.winner,
                points: 70
            },


            final: {
                winner: finalMatches[0]?.winner,
                points: 100
            }
        };


        updateState();

    } catch (error) {

        console.error(error);

        showResult(
            "Unable to load tournament data.",
            "red"
        );
    }
}


// -----------------------------
// UPDATE BRACKET
// -----------------------------

function updateState() {


    // -------------------------
    // QUARTERFINALS
    // -------------------------

    setButtonText(
        "qf1-t1",
        selection.m1 || "Winner Match 1"
    );

    setButtonText(
        "qf1-t2",
        selection.m2 || "Winner Match 2"
    );


    setButtonText(
        "qf2-t1",
        selection.m3 || "Winner Match 3"
    );

    setButtonText(
        "qf2-t2",
        selection.m4 || "Winner Match 4"
    );


    setButtonText(
        "qf3-t1",
        selection.m5 || "Winner Match 5"
    );

    setButtonText(
        "qf3-t2",
        selection.m6 || "Winner Match 6"
    );


    setButtonText(
        "qf4-t1",
        selection.m7 || "Winner Match 7"
    );

    setButtonText(
        "qf4-t2",
        selection.m8 || "Winner Match 8"
    );


    // -------------------------
    // SEMI FINALS
    // -------------------------

    setButtonText(
        "sf1-t1",
        selection.qf1 || "Winner Quarter 1"
    );

    setButtonText(
        "sf1-t2",
        selection.qf2 || "Winner Quarter 2"
    );


    setButtonText(
        "sf2-t1",
        selection.qf3 || "Winner Quarter 3"
    );

    setButtonText(
        "sf2-t2",
        selection.qf4 || "Winner Quarter 4"
    );


    // -------------------------
    // FINAL
    // -------------------------

    setButtonText(
        "final-t1",
        selection.sf1 || "Winner Semi 1"
    );

    setButtonText(
        "final-t2",
        selection.sf2 || "Winner Semi 2"
    );


    // -------------------------
    // DISABLE EMPTY ROUNDS
    // -------------------------

    setDisabled(
        "qf1-t1",
        !selection.m1
    );

    setDisabled(
        "qf1-t2",
        !selection.m2
    );


    setDisabled(
        "qf2-t1",
        !selection.m3
    );

    setDisabled(
        "qf2-t2",
        !selection.m4
    );


    setDisabled(
        "qf3-t1",
        !selection.m5
    );

    setDisabled(
        "qf3-t2",
        !selection.m6
    );


    setDisabled(
        "qf4-t1",
        !selection.m7
    );

    setDisabled(
        "qf4-t2",
        !selection.m8
    );


    setDisabled(
        "sf1-t1",
        !selection.qf1
    );

    setDisabled(
        "sf1-t2",
        !selection.qf2
    );


    setDisabled(
        "sf2-t1",
        !selection.qf3
    );

    setDisabled(
        "sf2-t2",
        !selection.qf4
    );


    setDisabled(
        "final-t1",
        !selection.sf1
    );

    setDisabled(
        "final-t2",
        !selection.sf2
    );


    refreshButtons();
}


// -----------------------------
// SET BUTTON TEXT
// -----------------------------

function setButtonText(id, text) {

    const button = document.getElementById(id);

    if (button) {
        button.innerText = text;
    }
}


// -----------------------------
// DISABLE BUTTON
// -----------------------------

function setDisabled(id, value) {

    const button = document.getElementById(id);

    if (button) {
        button.disabled = value;
    }
}


// -----------------------------
// REFRESH SELECTED BUTTONS
// -----------------------------

function refreshButtons() {

    Object.keys(selection).forEach(stage => {

        const match =
            document.getElementById(stage);

        if (!match) return;

        const buttons =
            match.getElementsByClassName(
                "team-button"
            );

        Array.from(buttons).forEach(button => {

            button.classList.remove(
                "selected",
                "correct",
                "incorrect"
            );

            if (
                selection[stage] ===
                button.innerText
            ) {

                button.classList.add(
                    "selected"
                );
            }
        });
    });
}

// -----------------------------
// CLEAR DEPENDENT ROUNDS
// -----------------------------

function clearDependents(stage) {


    // Round of 16 → Quarterfinals

    if (stage === "m1" || stage === "m2") {

        selection.qf1 = null;
        selection.sf1 = null;
        selection.final = null;
    }


    if (stage === "m3" || stage === "m4") {

        selection.qf2 = null;
        selection.sf1 = null;
        selection.final = null;
    }


    if (stage === "m5" || stage === "m6") {

        selection.qf3 = null;
        selection.sf2 = null;
        selection.final = null;
    }


    if (stage === "m7" || stage === "m8") {

        selection.qf4 = null;
        selection.sf2 = null;
        selection.final = null;
    }


    // Quarterfinals → Semi Finals

    if (stage === "qf1" || stage === "qf2") {

        selection.sf1 = null;
        selection.final = null;
    }


    if (stage === "qf3" || stage === "qf4") {

        selection.sf2 = null;
        selection.final = null;
    }


    // Semi Finals → Final

    if (stage === "sf1" || stage === "sf2") {

        selection.final = null;
    }
}


// -----------------------------
// SELECT TEAM
// -----------------------------

function selectTeam(stage, team) {

    if (submitted || !team) return;


    // Don't allow placeholder buttons

    if (
        team.startsWith("Winner Match") ||
        team.startsWith("Winner Quarter") ||
        team.startsWith("Winner Semi")
    ) {
        return;
    }


    clearDependents(stage);

    selection[stage] = team;

    saveSelections();

    updateState();
}


// -----------------------------
// AUTH HEADERS
// -----------------------------

async function getAuthHeaders() {

    const currentUser = auth.currentUser;

    if (currentUser) {
        const token = await currentUser.getIdToken(true);
        localStorage.setItem("token", token);

        return {
            Authorization: token
        };
    }

    const token =
        localStorage.getItem("token");

    return token
        ? {
            Authorization: token
        }
        : {};
}


// -----------------------------
// SUBMIT BRACKET
// -----------------------------

async function submitBracket() {

    if (submitted) {
        showResult("This bracket has already been submitted and cannot be changed.", "red");
        return;
    }

    const missingStages = Object.keys(stagePoints)
        .filter(stage => !selection[stage]);


    if (missingStages.length > 0) {

        showResult(
            `Please complete these predictions: ${missingStages.join(", ")}.`,
            "red"
        );

        return;
    }


    try {

        const authHeaders = await getAuthHeaders();

        if (!authHeaders.Authorization) {
            showResult(
                "Please log in or sign up before submitting your bracket.",
                "red"
            );
            return;
        }

        const response =
            await fetch("/predict", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    ...authHeaders
                },

                body: JSON.stringify({
                    selections: selection
                })
            });


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Submission failed"
            );
        }

        showResult(
            `✅ Bracket submitted successfully! Score: ${result.total_points}. Opening leaderboard...`,
            "green"
        );

        submitted = true;
        lockSubmittedBracket();

        setTimeout(() => {
            window.location.href = "leaderboard.html";
        }, 500);


    } catch (error) {

        console.error(error);

        showResult(
            `❌ ${error.message}`,
            "red"
        );
    }
}


// -----------------------------
// RESET
// -----------------------------

function resetBracket() {

    if (submitted) {
        showResult("This bracket has already been submitted and cannot be changed.", "red");
        return;
    }

    if (
        !confirm(
            "Reset all your predictions?"
        )
    ) {
        return;
    }


    Object.keys(selection).forEach(
        key => {
            selection[key] = null;
        }
    );


    localStorage.removeItem(getStorageKey());


    showResult(
        "",
        "black"
    );


    updateState();
}


// -----------------------------
// LEADERBOARD
// -----------------------------

function openLeaderboardPage() {

    window.location.href =
        "leaderboard.html";
}

async function logoutUser() {
    try {
        await auth.signOut();
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        window.location.href = "login.html";
    }
}


// -----------------------------
// RESULT MESSAGE
// -----------------------------

function showResult(message, color) {

    const result =
        document.getElementById("result");

    if (!result) return;

    result.innerText = message;

    result.style.color = color;
}

function lockSubmittedBracket() {
    document.querySelectorAll(".team-button").forEach(button => {
        button.disabled = true;
    });

    document.querySelectorAll(".submit-button, .reset-button").forEach(button => {
        button.disabled = true;
    });
}

async function loadSubmittedPrediction(user) {
    const response = await fetch("/my-prediction", {
        headers: {
            Authorization: await user.getIdToken()
        },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Unable to load your saved prediction");
    }

    const data = await response.json();

    if (!data.submitted || !data.prediction) {
        return false;
    }

    selection = loadSelections(getStorageKey());
    Object.keys(selection).forEach(stage => {
        selection[stage] = data.prediction.selections[stage] || null;
    });
    saveSelections();
    submitted = true;
    return true;
}


// -----------------------------
// START
// -----------------------------

function requireAuthAndLoad() {
    auth.onAuthStateChanged(async user => {
        if (!user) {
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            window.location.href = "signup.html";
            return;
        }

        const idToken = await user.getIdToken();
        selection = loadSelections(getStorageKey());
        localStorage.setItem("token", idToken);
        localStorage.setItem("userName", user.displayName || user.email.split("@")[0]);
        try {
            await loadSubmittedPrediction(user);
            await fetchBracketData();
            if (submitted) {
                lockSubmittedBracket();
                showResult("This bracket has already been submitted and cannot be changed.", "black");
            }
        } catch (error) {
            console.error(error);
            showResult("Unable to load your saved prediction.", "red");
        }
    });
}

document.addEventListener(
    "DOMContentLoaded",
    requireAuthAndLoad
);