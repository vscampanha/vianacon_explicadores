let games = [];
let currentDifficultyFilter = "all";
let currentCategoryFilter = "all";

const categoryOrder = [
  "Simples",
  "Médio",
  "Complexo",
  "Amigável",
  "Kids",
  "Duplas",
  "Grupos",
  "Destreza",
  "Corrida",
  "Handicap",
];

function getCategoriesForGame(game) {
  if (!game || !Array.isArray(game.suggestionCategory)) {
    return [];
  }

  return game.suggestionCategory.filter(Boolean);
}

function buildCategoryFilters() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const uniqueCategories = new Set();
  games.forEach((game) => {
    getCategoriesForGame(game).forEach((category) => uniqueCategories.add(category));
  });

  const categories = categoryOrder.filter((category) => uniqueCategories.has(category));

  const options = [
    '<option value="all">All</option>',
    ...categories.map((category) => `<option value="${category}">${category}</option>`),
  ];

  select.innerHTML = options.join("");
  select.value = currentCategoryFilter === "all" || !categories.includes(currentCategoryFilter) ? "all" : currentCategoryFilter;

  select.onchange = () => {
    currentCategoryFilter = select.value || "all";
    syncGlobalResetState();
    searchGames();
  };
}

function syncGlobalResetState() {
  const filterButtons = document.querySelectorAll(".difficulty-filter");

  filterButtons.forEach((button) => {
    const isActive = (button.dataset.filter || "all") === currentDifficultyFilter;
    button.classList.toggle("active", isActive);
  });

  const categorySelect = document.getElementById("categoryFilter");
  if (categorySelect) {
    categorySelect.value = currentCategoryFilter === "all" || !categoryOrder.includes(currentCategoryFilter) ? "all" : currentCategoryFilter;
  }
}

function resetAllFilters() {
  currentDifficultyFilter = "all";
  currentCategoryFilter = "all";

  const categorySelect = document.getElementById("categoryFilter");
  if (categorySelect) {
    categorySelect.value = "all";
  }

  syncGlobalResetState();
  searchGames();
}

function applyTheme(theme) {
  const body = document.body;
  const button = document.getElementById("themeToggle");

  const isDark = theme === "dark";
  body.classList.toggle("dark-mode", isDark);

  if (button) {
    button.innerHTML = isDark ? "☾" : "☀";
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("themePreference");
  const preferredTheme = savedTheme || "light";
  applyTheme(preferredTheme);

  const toggleButton = document.getElementById("themeToggle");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      localStorage.setItem("themePreference", nextTheme);
      applyTheme(nextTheme);
    });
  }
}

window.onload = function () {
  initTheme();
  attachDifficultyFilters();

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
      buildCategoryFilters();
      searchGames();
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

function getFilteredGames() {
  const searchInput = document.getElementById("searchBar")?.value.toLowerCase() || "";

  return games.filter((game) => {
    if (!game || !Array.isArray(game.personas) || game.personas.length === 0) {
      return false;
    }

    const matchesSearch = !searchInput || game.gameName.toLowerCase().includes(searchInput);
    if (!matchesSearch) return false;

    if (currentCategoryFilter !== "all") {
      const categories = getCategoriesForGame(game);
      if (!categories.includes(currentCategoryFilter)) {
        return false;
      }
    }

    const weight = getDifficultyValue(game);
    if (currentDifficultyFilter === "all") return true;

    if (weight === null || weight === undefined || Number.isNaN(weight)) return false;

    const filterMap = {
      "0-1": [0, 1],
      "1-2": [1, 2],
      "2-3": [2, 3],
      "3-4": [3, 4],
      "4-5": [4, 5],
    };

    const [min, max] = filterMap[currentDifficultyFilter] || [0, 5];
    return weight >= min && weight <= max;
  });
}

function searchGames() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const filteredGames = getFilteredGames();

  if (!filteredGames || filteredGames.length === 0) {
    resultsDiv.innerHTML = "No games found";
    return;
  }

  filteredGames.forEach((game) => {
    const gameDiv = document.createElement("div");
    gameDiv.classList.add("result-item");

    if (!game.personas || game.personas.length === 0) {
      return;
    }

    const difficultyValue = getDifficultyValue(game);
    const difficultyBadge = difficultyValue !== null
      ? `<span class="${getDifficultyClass(difficultyValue)}">${difficultyValue.toFixed(2)}</span>`
      : `<span class="difficulty-badge difficulty-unknown">N/A</span>`;

    const personasText = game.personas && game.personas.length > 0
      ? game.personas.join(", ")
      : "<em>Nenhum</em>";

    const playersLabel = getPlayersLabel(game);
    const playersBadge = playersLabel ? `<span class="players-badge">${playersLabel}</span>` : "";

    const categoryBadges = getCategoriesForGame(game)
      .map((category) => `<span class="suggestion-category-tag">${category}</span>`)
      .join("");

    gameDiv.innerHTML = `
      <div class="game-row">
        <strong>${game.gameName}</strong>
        ${playersBadge}
        ${difficultyBadge}
      </div>
      <div class="category-row">${categoryBadges}</div>
      <div>${personasText}</div>
    `;

    resultsDiv.appendChild(gameDiv);
  });
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

if (btn && modal) {
  btn.onclick = function () {
    modal.style.display = "block";
  };
}

if (span && modal) {
  span.onclick = function () {
    modal.style.display = "none";
  };
}

window.onclick = function (event) {
  if (modal && event.target == modal) {
    modal.style.display = "none";
  }
};

function closeModal() {
  if (modal) {
    modal.style.display = "none";
  }
}

function getDifficultyClass(weight) {
  if (weight === null || weight === undefined || Number.isNaN(Number(weight))) {
    return "difficulty-badge difficulty-unknown";
  }

  const value = Number(weight);

  if (value < 1) return "difficulty-badge difficulty-light-green";
  if (value <= 2) return "difficulty-badge difficulty-green";
  if (value <= 3) return "difficulty-badge difficulty-yellow";
  if (value <= 4) return "difficulty-badge difficulty-orange";
  if (value <= 5) return "difficulty-badge difficulty-red";

  return "difficulty-badge difficulty-unknown";
}

function getDifficultyValue(game) {
  const value = game?.gameWeigth ?? game?.weight;
  return value === null || value === undefined ? null : Number(value);
}

function attachDifficultyFilters() {
  const filterButtons = document.querySelectorAll(".difficulty-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentDifficultyFilter = button.dataset.filter || "all";
      filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      syncGlobalResetState();
      searchGames();
    });
  });

  const resetButton = document.querySelector(".global-all-filter");
  if (resetButton) {
    resetButton.addEventListener("click", resetAllFilters);
  }
}

function getPlayersLabel(game) {
  const minPlayers = game?.minPlayers ?? game?.['game.min_players'];
  const maxPlayers = game?.maxPlayers ?? game?.['game.max_players'];

  if (minPlayers === undefined || minPlayers === null || maxPlayers === undefined || maxPlayers === null) {
    return null;
  }

  return `${minPlayers}-${maxPlayers} J`;
}