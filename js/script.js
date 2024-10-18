let games = [];

// Load games from sessionStorage or fetch games.json
window.onload = function () {
  const sessionData = sessionStorage.getItem("games");

  // Load games from the 'data/games.json' file
  fetch("data/games.json") // Adjusted to point to 'data' folder
    .then((response) => response.json())
    .then((data) => {
      games = data.games; // Load JSON games

      // If there's session data, prioritize it over JSON
      if (sessionData) {
        const localGames = JSON.parse(sessionData);
        mergeGames(localGames); // Merge local and JSON games, prioritizing local storage
      }

      // Save the current data back into session storage (if session is empty, initialize it)
      sessionStorage.setItem("games", JSON.stringify(games));
    })
    .catch((error) => console.error("Error loading games:", error));
};

// Merge games from JSON and localStorage, prioritizing localStorage
function mergeGames(localGames) {
  const mergedGames = [...localGames]; // Start with local storage data

  games.forEach((jsonGame) => {
    const foundInLocal = localGames.some(
      (localGame) => localGame.gameID === jsonGame.gameID
    );

    // If the game is not in local storage, add it from JSON
    if (!foundInLocal) {
      mergedGames.push(jsonGame);
    }
  });

  games = mergedGames; // Overwrite the global games array with merged data
}

// Search function
function searchGames() {
  const searchInput = document.getElementById("searchBar").value.toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!games || games.length === 0) {
    resultsDiv.innerHTML = "No games available";
    return;
  }

  const filteredGames = games.filter((game) => {
    // Ensure gameName exists before using toLowerCase
    return game.gameName && game.gameName.toLowerCase().includes(searchInput);
  });

  if (filteredGames.length > 0) {
    filteredGames.forEach((game) => {
      const gameDiv = document.createElement("div");
      gameDiv.classList.add("result-item");
      gameDiv.innerHTML = `<strong>${
        game.gameName
      }</strong> - Explicadores: ${game.personas.join(", ")}`;
      resultsDiv.appendChild(gameDiv);
    });
  } else {
    resultsDiv.innerHTML = "No games found";
  }
}

// // Function to handle CSV upload, convert to JSON, and download
// function downloadGamesJson() {
//   const fileInput = document.getElementById("csvFileInput");
//   const file = fileInput.files[0];

//   if (!file) {
//     alert("Please select a CSV file first.");
//     return;
//   }

//   Papa.parse(file, {
//     complete: function (results) {
//       const data = results.data;
//       const headers = data[0]; // Get header row
//       const uploadedGames = [];

//       for (let i = 1; i < data.length; i++) {
//         const row = data[i];
//         const gameID = row[0]?.trim(); // Object ID
//         const gameName = row[1]?.trim(); // Title

//         // Check if gameID or gameName is empty
//         if (!gameID || !gameName) {
//           continue; // Skip this record
//         }

//         const game = {
//           gameID: gameID,
//           gameName: gameName,
//           personas: [],
//         };

//         for (let j = 2; j < row.length; j++) {
//           if (row[j].toLowerCase() === "x") {
//             game.personas.push(headers[j]); // Add the person's name to personas
//           }
//         }

//         uploadedGames.push(game);
//       }

//       // Create a Blob from the uploaded JSON data
//       const jsonBlob = new Blob([JSON.stringify(uploadedGames, null, 2)], {
//         type: "application/json",
//       });
//       const url = URL.createObjectURL(jsonBlob);

//       // Create a temporary anchor element to trigger the download
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "games.json"; // Name of the downloaded file
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url); // Clean up the object URL

//       alert("CSV uploaded and JSON file downloaded.");
//       closeModal();
//     },
//   });
// }

// Function to handle CSV upload, convert to JSON, and download
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
      const headers = data[0]; // Get header row
      const uploadedGames = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const gameID = row[0]?.trim(); // Object ID
        const gameName = row[1]?.trim(); // Title

        // Check if gameID or gameName is empty
        if (!gameID || !gameName) {
          continue; // Skip this record
        }

        const game = {
          gameID: gameID,
          gameName: gameName,
          personas: [],
        };

        for (let j = 2; j < row.length; j++) {
          if (row[j].toLowerCase() === "x") {
            game.personas.push(headers[j]); // Add the person's name to personas
          }
        }

        uploadedGames.push(game);
      }

      // Wrap uploaded games in an object with a 'games' property
      const gamesObject = { games: uploadedGames };

      // Create a Blob from the uploaded JSON data
      const jsonBlob = new Blob([JSON.stringify(gamesObject, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(jsonBlob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "games.json"; // Name of the downloaded file
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the object URL

      alert("CSV uploaded and JSON file downloaded.");
      closeModal();
    },
  });
}

// CSV to JSON conversion and replace sessionStorage
function convertCSV() {
  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file first.");
    return;
  }

  // Clear local session data
  sessionStorage.removeItem("games");

  Papa.parse(file, {
    complete: function (results) {
      const data = results.data;
      const headers = data[0]; // Get header row
      const uploadedGames = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const game = {
          gameID: row[0], // Object ID
          gameName: row[1], // Title
          personas: [],
        };

        for (let j = 2; j < row.length; j++) {
          if (row[j].toLowerCase() === "x") {
            game.personas.push(headers[j]); // Add the person's name to personas
          }
        }

        uploadedGames.push(game);
      }

      // Store the newly uploaded data in sessionStorage
      sessionStorage.setItem("games", JSON.stringify(uploadedGames));

      // Merge uploaded data with JSON data
      mergeGames(uploadedGames);

      alert("CSV uploaded and session data updated.");
      closeModal();
    },
  });
}

// Modal handling
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
