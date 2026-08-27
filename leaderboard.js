async function fetchLeaderboard() {
  const container = document.getElementById("leaderboardContainer");

  try {
    const response = await fetch("/leaderboard", {
      cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load leaderboard");
    }

    const rows = Array.isArray(data)
      ? data
      : (Array.isArray(data.leaderboard) ? data.leaderboard : []);

    if (rows.length === 0) {
      container.innerHTML = "<p>No scores yet. Be the first to submit!</p>";
      return;
    }

    rows.sort((a, b) =>
      Number(b.score ?? b.total_score ?? 0) -
      Number(a.score ?? a.total_score ?? 0)
    );

    const table = document.createElement("table");
    table.className = "leaderboard-table";

    table.innerHTML = `
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    rows.forEach((entry, index) => {
      const row = document.createElement("tr");

      const rankCell = document.createElement("td");
      const rank = index + 1;
      rankCell.textContent =
        rank === 1 ? "1" :
        rank === 2 ? "2" :
        rank === 3 ? "3" :
        String(rank);

      // IMPORTANT: Flask stores the player's name as `player_name`.
      // Keep fallbacks so older Firestore records still display correctly.
      const playerName =
        entry.player_name ||
        entry.name ||
        entry.username ||
        entry.user ||
        "Anonymous";

      const nameCell = document.createElement("td");
      nameCell.textContent = String(playerName);

      const score = Number(entry.score ?? entry.total_score ?? 0);
      const scoreCell = document.createElement("td");
      const scoreStrong = document.createElement("strong");
      scoreStrong.textContent = String(score);
      scoreCell.appendChild(scoreStrong);

      const dateCell = document.createElement("td");
      dateCell.textContent = formatDate(entry.timestamp);

      row.append(rankCell, nameCell, scoreCell, dateCell);
      tbody.appendChild(row);
    });

    container.replaceChildren(table);
  } catch (error) {
    console.error("Leaderboard error:", error);
    container.innerHTML =
      "<p class='error'>Error loading leaderboard. Please try again.</p>";
  }
}

function formatDate(timestamp) {
  if (!timestamp) return "-";

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  } catch {
    return "-";
  }
}

document.addEventListener("DOMContentLoaded", fetchLeaderboard);
