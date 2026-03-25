/**
 * bit-icons - Dot Grid Icon System
 *
 * Each icon is defined as a 7x7 grid of 0s and 1s.
 * 0 = empty (background dot), 1 = filled (dark dot)
 * The four corners are excluded from the grid.
 * Dots render as squares.
 */

const GRID_SIZE = 7;
const DOT_SIZE = 4;       // square side length
const DOT_SPACING = 8;    // center-to-center
const BG_DOT_OPACITY = 0.1;

// Corner positions to exclude (top-left, top-right, bottom-left, bottom-right)
const EXCLUDED = new Set([
  '0,0', '0,6',
  '6,0', '6,6',
]);

function isExcluded(row, col) {
  return EXCLUDED.has(`${row},${col}`);
}

/**
 * Generate an SVG string from a 7x7 grid array
 */
function gridToSvg(grid, options = {}) {
  const {
    size = GRID_SIZE,
    dotSize = DOT_SIZE,
    spacing = DOT_SPACING,
    fgColor = 'currentColor',
    bgDots = false,
    bgOpacity = BG_DOT_OPACITY,
  } = options;

  const viewSize = size * spacing;
  const offset = spacing / 2;
  const half = dotSize / 2;

  let rects = '';

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isExcluded(row, col)) continue;

      const cx = offset + col * spacing;
      const cy = offset + row * spacing;
      const x = cx - half;
      const y = cy - half;
      const filled = grid[row]?.[col] === 1;

      if (filled) {
        rects += `<rect x="${x}" y="${y}" width="${dotSize}" height="${dotSize}" fill="${fgColor}"/>`;
      } else if (bgDots) {
        rects += `<rect x="${x}" y="${y}" width="${dotSize}" height="${dotSize}" fill="${fgColor}" opacity="${bgOpacity}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="${viewSize}" height="${viewSize}">${rects}</svg>`;
}

/**
 * Generate an SVG path from a grid - useful for font generation
 */
function gridToPath(grid, options = {}) {
  const {
    size = GRID_SIZE,
    dotSize = DOT_SIZE,
    spacing = DOT_SPACING,
  } = options;

  const offset = spacing / 2;
  const half = dotSize / 2;
  let path = '';

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isExcluded(row, col)) continue;
      if (grid[row]?.[col] === 1) {
        const x = offset + col * spacing - half;
        const y = offset + row * spacing - half;
        path += `M${x},${y}h${dotSize}v${dotSize}h-${dotSize}z`;
      }
    }
  }

  return path;
}

module.exports = { gridToSvg, gridToPath, GRID_SIZE, DOT_SIZE, DOT_SPACING, isExcluded };
