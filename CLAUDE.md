# bit-icons — AI Instructions

## On Every Commit

1. **Update the "Last updated" banner** in `dist/cheatsheet.html` to the current date.
2. **Rebuild all assets** before committing: `npm run build:all`
3. **Bump the version** in `package.json` if icons were added/removed/changed.
4. **Update version references** in `src/icons/index.js` header comment and cheatsheet.
5. **Ensure the font download link** in the cheatsheet Support tab points to the latest built font file (`dist/bit-icons.woff2`). If the font has been regenerated, verify the file is included in the commit.

## Project Structure

- `src/icons/index.js` — All icon definitions (7x7 grids)
- `src/grid.js` — SVG generator (squares, not circles; corners excluded)
- `scripts/build.js` — Builds SVGs, CSS, JS to `dist/`
- `scripts/build-cheatsheet.js` — Builds the cheatsheet HTML
- `scripts/build-font.js` — Builds the web font (woff2/ttf)
- `dist/` — Built output (SVGs, CSS, JS, font, cheatsheet)

## Build

```sh
npm run build:all
```

## Adding Icons

Add a new 7x7 grid export to `src/icons/index.js`. Corners [0,0], [0,6], [6,0], [6,6] are excluded. Then rebuild.

## Distribution

- npm: `npm publish`
- CDN: Push to GitHub, use jsDelivr or unpkg (`unpkg.com/bit-icons/dist/bit-icons.css`)
- Font: Download from cheatsheet Support tab or `dist/bit-icons.woff2`
