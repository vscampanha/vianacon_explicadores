# vianacon_explicadores

# CSV to JSON Converter

## Overview

This project provides a simple web application that allows users to upload a CSV file containing game data, convert the data into JSON format, and download the resulting JSON file. The application uses the Papa Parse library to handle CSV parsing.

## Features

- **Upload CSV File**: Users can select a CSV file containing game data.
- **Convert to JSON**: The application reads the CSV file and converts it into a structured JSON format.
- **Download JSON File**: After conversion, users can download the JSON file directly to their device.
- **Data Validation**: The application automatically filters out any records that do not have a valid `gameID` or `gameName`.

## CSV Format

The CSV file should adhere to the following format:

- The first row is the header containing the titles for each column.
- The subsequent rows represent individual game entries.
- An `x` indicates the presence of a persona associated with that game.

## Technologies Used

- HTML
- CSS
- JavaScript
- Papa Parse library for CSV parsing
