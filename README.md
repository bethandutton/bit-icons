# bit-icons

A free, open-source dot-grid icon library. 215+ pixel-perfect icons rendered as portrait rectangles on a 7x7 grid, with frame-based animations.

Think Font Awesome, but with a bit-art aesthetic.

## Features

- **215+ icons** — UI, arrows, communication, business, manufacturing, brands, and more
- **Pixel-perfect** — Every icon is hand-crafted on a 7x7 dot grid
- **Zero dependencies** — Pure SVG, CSS, or JS
- **Customizable** — Icons inherit `color` and scale with `font-size`
- **Free forever** — MIT licensed, free for personal and commercial use

## Quick Start

### CDN (easiest)

```html
<link rel="stylesheet" href="https://unpkg.com/bit-icons/dist/bit-icons.css">

<span class="bi bi-heart"></span>
<span class="bi bi-search"></span>
<span class="bi bi-settings"></span>
```

### npm

```bash
npm install bit-icons
```

```js
// Import the CSS
import 'bit-icons/dist/bit-icons.css';
```

```html
<span class="bi bi-heart"></span>
```

### Individual SVGs

```html
<img src="https://unpkg.com/bit-icons/dist/svg/heart.svg" width="24" alt="heart">
```

### JavaScript

```js
import icons from 'bit-icons';

// Access the raw 7x7 grid array
console.log(icons.heart);
// [[0,1,0,0,0,1,0], [1,1,1,0,1,1,1], ...]
```

## Icon Categories

| Category | Examples |
|----------|---------|
| **UI** | heart, star, search, settings, bell, trash, edit, lock |
| **Arrows** | arrow-up, arrow-down, chevron-left, chevron-right |
| **Communication** | comment, chat, reply, mail, mention, broadcast |
| **Business** | invoice, contract, briefcase, dollar, target, handshake |
| **Manufacturing** | factory, warehouse, forklift, truck, conveyor, robot |
| **Status** | approved, pending, rejected, in-progress, complete |
| **Data** | chart, pie-chart, bar-chart, spreadsheet, analytics |
| **People** | user, users, team, role, assign, delegate |
| **Operations** | inventory, barcode, scanner, quality, maintenance |
| **Brands** | github, linkedin, slack, figma, youtube, discord |
| **Navigation** | chevrons, external-link, expand, collapse, sidebar |
| **Media** | play, pause, stop, mic, headphones, camera |

## Animations

Every icon has a frame-based animation, inspired by old LED and dot-matrix displays. The dot grid stays fixed while individual dots flip between on (black) and off (grey) to create the illusion of movement.

- **Arrows** move across the grid in their direction
- **Heart** pulses by expanding its dots outward
- **Bell** bobs up and down
- **Download** arrow drops toward the line while the line stays still
- **Lock/Unlock** morph between each other
- **Settings** rotates around the grid

### Viewing animations

- **Cheatsheet** — Hover over any icon to see its animation
- **Modal** — Click an icon to open a detail view with a static/animated toggle
- **Download** — Export any animated icon as a GIF from the modal

### Using animations in your project

Animations are defined as frame arrays in `src/animations.js`. Each frame is a 7x7 grid of 0s and 1s, just like the icon definitions. To animate an icon, cycle through the frames and update which dots are "on" at each step.

```js
import icons from 'bit-icons';

// The base icon grid
const heart = icons.heart;
// heart[row][col] === 1 means that dot is filled
```

For the animation frame data, see `src/animations.js` which exports a `getAnimation(name)` function returning `{ frames, speed }`.

## Customization

### Sizing

Icons scale with `font-size`:

```css
.bi { font-size: 1.5rem; }   /* default */
.bi-lg { font-size: 2rem; }
.bi-sm { font-size: 0.875rem; }
```

### Coloring

Icons inherit the current text `color`:

```html
<span class="bi bi-heart" style="color: red;"></span>
<span class="bi bi-star" style="color: gold;"></span>
```

## Cheatsheet

Browse all icons with search, copy-to-clipboard, and SVG download:

Visit the [live cheatsheet](https://bit-icons.vercel.app/) or open `dist/cheatsheet.html` locally.

## Building from Source

```bash
# Install (no dependencies needed)
git clone https://github.com/bethandutton/bit-icons.git
cd bit-icons

# Build everything
npm run build:all

# Or build individually
npm run build            # SVGs, CSS, JS
npm run build:cheatsheet # Interactive docs
```

## Adding Icons

Each icon is a 7x7 grid in `src/icons/index.js`:

```js
exports.myicon = [
  [0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0],
  [0,1,0,0,0,1,0],
  [0,1,0,0,0,1,0],
  [0,1,0,0,0,1,0],
  [0,0,1,1,1,0,0],
  [0,0,0,0,0,0,0],
];
```

- `1` = filled rectangle, `0` = empty (background dot at 15% opacity)
- Corner positions `[0,0]`, `[0,6]`, `[6,0]`, `[6,6]` are excluded from rendering
- Run `npm run build:all` after adding

## Contributing

Contributions welcome! To add an icon:

1. Fork the repo
2. Add your icon grid to `src/icons/index.js`
3. Add an animation for it in `src/animations.js` (see the existing cases for examples)
4. Run `npm run build:all` and check the cheatsheet
5. Submit a PR

## License

MIT — free for personal and commercial use. No attribution required.

See [LICENSE](./LICENSE) for details.
