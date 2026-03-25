# Immoweb Price/m²

Chrome extension that displays price per square meter on [immoweb.be](https://www.immoweb.be) property listings.

## Features

- Shows a price/m² badge on search result cards (both large and medium layouts)
- Supports all three languages (EN, NL, FR)
- Skips price ranges, multi-price listings, and cards without surface area

## Install

1. Clone this repo
2. `npm install`
3. Open `chrome://extensions`
4. Enable **Developer mode** (top-right toggle)
5. Click **Load unpacked** and select this folder

## Development

```bash
npm test          # run tests once
npm run test:watch # run tests in watch mode
```

## How it works

Parses price and surface area from the DOM of each search result card and injects a badge next to the price. Badges are only shown when both a single price and surface area are available.
