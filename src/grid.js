/**
 * bit-icons - Dot Grid Icon System
 *
 * Each icon is defined as a 7x7 grid of 0s and 1s.
 * 0 = empty (grey dot), 1 = filled (dark dot)
 * The four corners are excluded from the grid.
 * Dots render as portrait rectangles.
 */

const GRID_SIZE = 7;
const DOT_WIDTH = 3;      // rectangle width
const DOT_HEIGHT = 5;     // rectangle height
const COL_SPACING = 7;    // horizontal center-to-center
const ROW_SPACING = 7;    // vertical center-to-center
const BG_DOT_OPACITY = 0.07;

// Corner positions to exclude (top-left, top-right, bottom-left, bottom-right)
const EXCLUDED = new Set([
  '0,0', '0,6',
  '6,0', '6,6',
]);

function isExcluded(row, col) {
  return EXCLUDED.has(`${row},${col}`);
}

/**
 * Generate an SVG string from a 7x7 grid array.
 *
 * When `animatable` is true, EVERY non-corner position gets a rect with
 * data-r/data-c attributes. Filled dots get fgColor, empty dots get bgColor.
 * This lets JS flip any dot between on/off states for frame animation.
 */
function gridToSvg(grid, options = {}) {
  const {
    size = GRID_SIZE,
    dotWidth = DOT_WIDTH,
    dotHeight = DOT_HEIGHT,
    colSpacing = COL_SPACING,
    rowSpacing = ROW_SPACING,
    fgColor = 'currentColor',
    bgColor = '#cccccc',
    bgDots = false,
    bgOpacity = BG_DOT_OPACITY,
    animatable = false,
  } = options;

  const viewW = (size - 1) * colSpacing + dotWidth;
  const viewH = (size - 1) * rowSpacing + dotHeight;

  let rects = '';

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isExcluded(row, col)) continue;

      const x = col * colSpacing;
      const y = row * rowSpacing;
      const filled = grid[row]?.[col] === 1;

      if (animatable) {
        const dataAttrs = ` data-r="${row}" data-c="${col}"`;
        if (filled) {
          rects += `<rect x="${x}" y="${y}" width="${dotWidth}" height="${dotHeight}" fill="${fgColor}"${dataAttrs}/>`;
        } else {
          rects += `<rect x="${x}" y="${y}" width="${dotWidth}" height="${dotHeight}" fill="${bgColor}" opacity="${bgOpacity}"${dataAttrs}/>`;
        }
      } else {
        if (filled) {
          rects += `<rect x="${x}" y="${y}" width="${dotWidth}" height="${dotHeight}" fill="${fgColor}"/>`;
        } else if (bgDots) {
          rects += `<rect x="${x}" y="${y}" width="${dotWidth}" height="${dotHeight}" fill="${bgColor}" opacity="${bgOpacity}"/>`;
        }
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="${viewW}" height="${viewH}">${rects}</svg>`;
}

/**
 * Generate an SVG path from a grid - useful for font generation
 */
function gridToPath(grid, options = {}) {
  const {
    size = GRID_SIZE,
    dotWidth = DOT_WIDTH,
    dotHeight = DOT_HEIGHT,
    colSpacing = COL_SPACING,
    rowSpacing = ROW_SPACING,
  } = options;

  const viewW = (size - 1) * colSpacing + dotWidth;
  const viewH = (size - 1) * rowSpacing + dotHeight;
  let path = '';

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isExcluded(row, col)) continue;
      if (grid[row]?.[col] === 1) {
        const x = col * colSpacing;
        const y = row * rowSpacing;
        path += `M${x},${y}h${dotWidth}v${dotHeight}h-${dotWidth}z`;
      }
    }
  }

  return path;
}

module.exports = { gridToSvg, gridToPath, GRID_SIZE, DOT_WIDTH, DOT_HEIGHT, COL_SPACING, ROW_SPACING, isExcluded };
