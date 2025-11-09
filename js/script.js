let games = [];

window.onload = function () {
  const sessionData = sessionStorage.getItem("games");

  fetch("data/games.json")
    .then((response) => response.json())
    .then((data) => {
      games = data.games;

      if (sessionData) {
        const localGames = JSON.parse(sessionData);
        mergeGames(localGames);
      }

      sessionStorage.setItem("games", JSON.stringify(games));
    })
    .catch((error) => console.error("Error loading games:", error));
};

function mergeGames(localGames) {
  const mergedGames = [...localGames];

  games.forEach((jsonGame) => {
    const foundInLocal = localGames.some(
      (localGame) => localGame.gameName === jsonGame.gameName
    );
    if (!foundInLocal) mergedGames.push(jsonGame);
  });

  games = mergedGames;
}

function searchGames() {
  const searchInput = document.getElementById("searchBar").value.toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!searchInput) return;

  if (!games || games.length === 0) {
    resultsDiv.innerHTML = "No games available";
    return;
  }

  const filteredGames = games.filter((game) =>
    game.gameName.toLowerCase().includes(searchInput)
  );

  if (filteredGames.length > 0) {
    filteredGames.forEach((game) => {
      const gameDiv = document.createElement("div");
      gameDiv.classList.add("result-item");

      if (!game.personas || game.personas.length === 0) {
        gameDiv.style.border = "1px solid rgba(255, 99, 99, 0.6)";
        gameDiv.style.borderRadius = "8px";
        gameDiv.style.padding = "6px";
        gameDiv.style.marginBottom = "6px";
        gameDiv.style.opacity = "0.6";
      }

      gameDiv.innerHTML = `<strong>${game.gameName}</strong> - ${
        game.personas.length > 0 ? game.personas.join(", ") : "<em>Nenhum</em>"
      }`;

      resultsDiv.appendChild(gameDiv);
    });
  } else {
    resultsDiv.innerHTML = "No games found";
  }
}

function downloadGamesJson() {
  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file first.");
    return;
  }

  Papa.parse(file, {
    complete: function (results) {
      const data = results.data;
      const headers = data[0];
      const persons = headers.slice(1);
      const uploadedGames = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const gameName = row[0]?.trim();
        if (!gameName) continue;

        const personas = [];

        for (let j = 1; j < row.length; j++) {
          const cell = row[j]?.trim().toLowerCase();
          if (cell && cell === "x") personas.push(persons[j - 1]);
        }

        uploadedGames.push({
          gameName: gameName,
          personas: personas,
        });
      }

      const gamesObject = { games: uploadedGames };

      const jsonBlob = new Blob([JSON.stringify(gamesObject, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(jsonBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "games.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("CSV uploaded and JSON file downloaded.");
      closeModal();
    },
  });
}

function convertCSV() {
  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file first.");
    return;
  }

  sessionStorage.removeItem("games");

  Papa.parse(file, {
    complete: function (results) {
      const data = results.data;
      const headers = data[0];
      const persons = headers.slice(1);
      const uploadedGames = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const gameName = row[0]?.trim();
        if (!gameName) continue;

        const personas = [];

        for (let j = 1; j < row.length; j++) {
          const cell = row[j]?.trim().toLowerCase();
          if (cell && cell === "x") personas.push(persons[j - 1]);
        }

        uploadedGames.push({
          gameName: gameName,
          personas: personas,
        });
      }

      sessionStorage.setItem("games", JSON.stringify(uploadedGames));
      mergeGames(uploadedGames);

      alert("CSV uploaded and session data updated.");
      closeModal();
    },
  });
}

const modal = document.getElementById("uploadModal");
const btn = document.getElementById("uploadBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function closeModal() {
  modal.style.display = "none";
}