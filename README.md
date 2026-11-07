# VianaCon Explicadores

A lightweight static web app for browsing board games by persona, difficulty, and suggestion category.

## Overview

This project displays a curated list of games with:

- game name
- player count badge
- difficulty badge
- assigned personas
- suggestion categories

The app is built as a static HTML/CSS/JavaScript site and loads its data from `data/games.json`.

## Features

- Search games by name
- Filter by difficulty (`All`, `0-1`, `1-2`, `2-3`, `3-4`, `4-5`)
- Filter by category via dropdown
- Show player count and weight metadata per game
- Mobile-friendly compact layout
- Light/dark mode toggle
- GitHub Pages deployment ready

## Project Structure

- `index.html` – app shell and filter controls
- `js/script.js` – data loading, filtering, rendering, and theme logic
- `style/styles.css` – layout, colors, badges, and responsive styling
- `data/games.json` – main game dataset
- `.github/workflows/pages.yml` – GitHub Pages deployment workflow

## Data Format

The app reads a JSON dataset in this shape:

```json
{
  "games": [
    {
      "gameName": "Cascadia",
      "personas": ["João", "Maria"],
      "gameWeigth": 2.3,
      "minPlayers": 1,
      "maxPlayers": 4,
      "suggestionCategory": ["Duplas", "Amigável"]
    }
  ]
}
```

## Run locally

Open `index.html` directly in a browser, or serve the project with a local static server from the project folder.

## Deployment

The project is configured for GitHub Pages using the workflow in `.github/workflows/pages.yml`.
