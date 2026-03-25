const fs = require('fs');
const path = require('path');
const { gridToSvg, gridToPath } = require('../src/grid');
const icons = require('../src/icons');

const distDir = path.join(__dirname, '..', 'dist');
const svgDir = path.join(distDir, 'svg');

fs.mkdirSync(svgDir, { recursive: true });

const iconNames = Object.keys(icons);

// Generate individual SVGs (with background dots, inheriting currentColor)
iconNames.forEach(name => {
  const svg = gridToSvg(icons[name], { bgDots: true, bgOpacity: 0.1 });
  fs.writeFileSync(path.join(svgDir, `${name}.svg`), svg);
});

// Generate CSS with inline SVG data URIs
let css = `/* bit-icons v0.1.0 */
.bi {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  vertical-align: -0.125em;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
`;

iconNames.forEach(name => {
  // For CSS, we use black fills and let CSS filter handle coloring
  const svg = gridToSvg(icons[name], { bgDots: true, bgOpacity: 0.1, fgColor: '#000' });
  const encoded = Buffer.from(svg).toString('base64');
  css += `.bi-${name} { background-image: url("data:image/svg+xml;base64,${encoded}"); }\n`;
});

fs.writeFileSync(path.join(distDir, 'bit-icons.css'), css);

// Generate JS module
let jsModule = `/* bit-icons v0.1.0 */\n`;
jsModule += `const icons = ${JSON.stringify(icons, null, 2)};\n`;
jsModule += `module.exports = icons;\n`;
jsModule += `if (typeof window !== 'undefined') window.bitIcons = icons;\n`;

fs.writeFileSync(path.join(distDir, 'bit-icons.js'), jsModule);

console.log(`Built ${iconNames.length} icons: ${iconNames.join(', ')}`);
