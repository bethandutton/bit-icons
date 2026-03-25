const assert = require('assert');
const path = require('path');
const fs = require('fs');

const icons = require('../src/icons');
const { gridToSvg, gridToPath } = require('../src/grid');
const { getAnimation } = require('../src/animations');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL: ${name}`);
    console.error(`        ${e.message}`);
  }
}

const iconNames = Object.keys(icons);

console.log(`\nFound ${iconNames.length} icons\n`);

// ── 1. Icon definitions: every icon is a 7x7 array of 0s and 1s ──

console.log('Icon definitions:');
for (const name of iconNames) {
  test(`${name} is a 7x7 grid of 0s and 1s`, () => {
    const grid = icons[name];
    assert.strictEqual(grid.length, 7, `${name} has ${grid.length} rows, expected 7`);
    for (let r = 0; r < 7; r++) {
      assert.strictEqual(grid[r].length, 7, `${name} row ${r} has ${grid[r].length} cols, expected 7`);
      for (let c = 0; c < 7; c++) {
        assert.ok(grid[r][c] === 0 || grid[r][c] === 1, `${name}[${r}][${c}] = ${grid[r][c]}, expected 0 or 1`);
      }
    }
  });
}

// ── 2. Corner exclusion: corners should ideally be 0 ──

console.log('\nCorner exclusion:');
const corners = [[0,0],[0,6],[6,0],[6,6]];
for (const name of iconNames) {
  test(`${name} corners are 0`, () => {
    const grid = icons[name];
    for (const [r, c] of corners) {
      assert.strictEqual(grid[r][c], 0, `${name}[${r}][${c}] = ${grid[r][c]}, expected 0 (excluded corner)`);
    }
  });
}

// ── 3. gridToSvg: basic output ──

console.log('\ngridToSvg:');
const sampleGrid = icons[iconNames[0]];

test('returns a string starting with <svg', () => {
  const svg = gridToSvg(sampleGrid);
  assert.ok(typeof svg === 'string');
  assert.ok(svg.startsWith('<svg'), 'should start with <svg');
});

test('contains rect elements', () => {
  const svg = gridToSvg(sampleGrid);
  assert.ok(svg.includes('rect'), 'should contain rect elements');
});

test('bgDots=false produces fewer rects than bgDots=true', () => {
  const withoutBg = gridToSvg(sampleGrid, { bgDots: false });
  const withBg = gridToSvg(sampleGrid, { bgDots: true });
  const countRects = (s) => (s.match(/<rect /g) || []).length;
  assert.ok(countRects(withBg) > countRects(withoutBg), 'bgDots=true should produce more rects');
});

// ── 4. gridToSvg animatable mode ──

console.log('\ngridToSvg animatable mode:');

test('animatable=true adds data-r and data-c attributes to every non-corner position', () => {
  const svg = gridToSvg(sampleGrid, { animatable: true });
  const dataRMatches = svg.match(/data-r="/g) || [];
  const dataCMatches = svg.match(/data-c="/g) || [];
  // 7x7 = 49 minus 4 corners = 45 positions
  assert.strictEqual(dataRMatches.length, 45, `expected 45 data-r attributes, got ${dataRMatches.length}`);
  assert.strictEqual(dataCMatches.length, 45, `expected 45 data-c attributes, got ${dataCMatches.length}`);
});

// ── 5. gridToPath ──

console.log('\ngridToPath:');

test('returns a string with M commands for filled cells', () => {
  const p = gridToPath(sampleGrid);
  assert.ok(typeof p === 'string');
  assert.ok(p.includes('M'), 'should contain M commands');
});

test('empty grid returns empty string', () => {
  const empty = Array.from({ length: 7 }, () => Array(7).fill(0));
  const p = gridToPath(empty);
  assert.strictEqual(p, '');
});

// ── 6. Animations: every non-brand icon has an animation ──

console.log('\nAnimations:');

// "bit-icons" is the logo and may not have an animation
const animatableIcons = iconNames.filter(n => n !== 'bit-icons' && n !== 'bitIcons');

for (const name of animatableIcons) {
  test(`${name} has an animation`, () => {
    const anim = getAnimation(name);
    assert.ok(anim !== null && anim !== undefined, `${name} has no animation`);
  });
}

// ── 7. Animation frames: each animation has >= 2 frames of valid 7x7 grids ──

console.log('\nAnimation frames:');

for (const name of animatableIcons) {
  const anim = getAnimation(name);
  if (!anim) continue;

  const frames = anim.frames || anim;

  test(`${name} animation has >= 2 frames`, () => {
    assert.ok(frames.length >= 2, `${name} has ${frames.length} frames, expected >= 2`);
  });

  test(`${name} animation frames are valid 7x7 grids of 0s and 1s`, () => {
    for (let f = 0; f < frames.length; f++) {
      const frame = frames[f];
      assert.strictEqual(frame.length, 7, `${name} frame ${f} has ${frame.length} rows`);
      for (let r = 0; r < 7; r++) {
        assert.strictEqual(frame[r].length, 7, `${name} frame ${f} row ${r} has ${frame[r].length} cols`);
        for (let c = 0; c < 7; c++) {
          assert.ok(frame[r][c] === 0 || frame[r][c] === 1, `${name} frame ${f}[${r}][${c}] = ${frame[r][c]}`);
        }
      }
    }
  });
}

// ── 8. Build output ──

console.log('\nBuild output:');
const distDir = path.join(__dirname, '..', 'dist');

test('dist/index.html exists', () => {
  assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html not found');
});

test('dist/bit-icons.css exists', () => {
  assert.ok(fs.existsSync(path.join(distDir, 'bit-icons.css')), 'dist/bit-icons.css not found');
});

test('dist/svg/ directory has .svg files', () => {
  const svgDir = path.join(distDir, 'svg');
  assert.ok(fs.existsSync(svgDir), 'dist/svg/ directory not found');
  const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
  assert.ok(svgFiles.length > 0, 'no .svg files in dist/svg/');
});

// ── Summary ──

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
