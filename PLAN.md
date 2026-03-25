# bit-icons — Project Plan

## What is bit-icons?

A free, open-source dot-grid icon library (like Font Awesome) with a pixel/bit-art aesthetic. Icons are defined as 7x7 grids with clipped corners, rendered as squares.

## Current Status (v1.0.0)

- [x] 215 icons across 12 categories
- [x] SVG generation from grid definitions
- [x] CSS stylesheet with inline SVG data URIs
- [x] JS module for programmatic access
- [x] Interactive cheatsheet with search, copy-to-clipboard, SVG download
- [x] Landing page with animated hero grid
- [x] Tabs: Icons, Support, License (MIT — free for personal & commercial)
- [x] Brand icons (GitHub, LinkedIn, Slack, Figma, etc.)
- [x] Manufacturing/B2B icons (factory, warehouse, forklift, etc.)
- [x] Leverage brand icon
- [x] "Last updated" banner auto-generated on build
- [x] CLAUDE.md with AI commit instructions

## To Do — Publishing

### 1. GitHub (Free)
- [ ] `git init` + first commit
- [ ] Create GitHub repo (public, MIT license)
- [ ] Push to GitHub
- [ ] Add GitHub Pages for the cheatsheet (Settings > Pages > deploy from `dist/`)
- [ ] Add topics/tags: `icons`, `svg`, `pixel-art`, `dot-grid`, `icon-font`, `css`

### 2. npm (Free)
- [ ] Create free npm account at https://www.npmjs.com/signup
- [ ] `npm login`
- [ ] `npm publish` — package is already configured
- [ ] CDN links will auto-work:
  - `https://unpkg.com/bit-icons/dist/bit-icons.css`
  - `https://cdn.jsdelivr.net/npm/bit-icons/dist/bit-icons.css`

### 3. Font Build (Future)
- [ ] Install `svg2ttf`, `ttf2woff2` packages
- [ ] Wire up `scripts/build-font.js` to generate `.woff2` and `.ttf`
- [ ] Map each icon to a Unicode Private Use Area codepoint (U+E001+)
- [ ] Enable font download button in cheatsheet

## Architecture

```
bit-icons/
├── src/
│   ├── icons/index.js    # 7x7 grid definitions (single source of truth)
│   └── grid.js           # SVG generator (squares, corners excluded)
├── scripts/
│   ├── build.js          # Builds SVGs, CSS, JS → dist/
│   ├── build-cheatsheet.js
│   └── build-font.js     # (placeholder)
├── dist/                 # Built output
│   ├── svg/              # Individual SVG files
│   ├── bit-icons.css     # CSS with inline SVGs
│   ├── bit-icons.js      # JS module
│   └── cheatsheet.html   # Interactive docs
├── package.json
├── README.md
├── LICENSE
├── CLAUDE.md             # AI commit instructions
├── PLAN.md               # This file
├── .gitignore
└── .npmignore
```

## How People Use It

### CSS (recommended)
```html
<link rel="stylesheet" href="https://unpkg.com/bit-icons/dist/bit-icons.css">
<span class="bi bi-heart"></span>
```

### npm
```bash
npm install bit-icons
```
```js
import 'bit-icons/dist/bit-icons.css';
```

### Individual SVGs
```html
<img src="https://unpkg.com/bit-icons/dist/svg/heart.svg" width="24">
```

### JavaScript (programmatic)
```js
import icons from 'bit-icons';
console.log(icons.heart); // 7x7 grid array
```

## Costs

Everything is free:
- GitHub: free (public repo)
- npm: free (public package)
- unpkg / jsDelivr CDN: free (auto-mirrors npm)
- GitHub Pages (cheatsheet hosting): free
- Optional: custom domain (~$10/yr, not required)

## Adding New Icons

1. Add a 7x7 grid to `src/icons/index.js`
2. Corners [0,0], [0,6], [6,0], [6,6] are excluded
3. Run `npm run build:all`
4. Commit and publish
