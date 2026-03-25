const fs = require('fs');
const path = require('path');
const { gridToSvg } = require('../src/grid');
const icons = require('../src/icons');
const { getAnimation } = require('../src/animations');
const pkg = require('../package.json');

// Read GIF encoder for embedding in the page
const gifEncoderSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'gif-encoder.js'), 'utf8')
  .replace(/\/\*\*[\s\S]*?\*\//g, '') // strip block comments
  .replace(/\/\/.*/g, '')             // strip line comments
  .replace(/if\s*\(typeof module[\s\S]*$/m, '') // strip module.exports
  .trim();

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const changelogRaw = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : 'No changelog yet.';
const changelogHtml = changelogRaw
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/^## (.+)$/gm, '</ul><h3>$1</h3><ul>')
  .replace(/^# (.+)$/gm, '<h2>$1</h2>')
  .replace(/^- (.+)$/gm, '<li>$1</li>')
  .replace(/\n\n/g, '\n')
  + '</ul>';

const distDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(distDir, { recursive: true });

const iconNames = Object.keys(icons);
const version = pkg.version;
const buildDate = new Date().toISOString().split('T')[0];

// Logo SVG from the bit-icons icon
const logoSvg = gridToSvg(icons['bit-icons'], { bgDots: true, bgOpacity: 0.1, fgColor: 'currentColor' });

// Build icon data for cards and modal
const iconDataObj = {};
const animDataObj = {};

const iconCards = iconNames.filter(n => n !== 'bit-icons').map(name => {
  const anim = getAnimation(name);

  // Animatable SVG for the card (every dot has data-r/data-c for JS frame flipping)
  const svg = gridToSvg(icons[name], {
    bgColor: '#999999', bgOpacity: 0.15, fgColor: '#111111',
    animatable: true,
  });

  // Clean static SVG for download
  const svgStatic = gridToSvg(icons[name], {
    bgDots: true, bgColor: '#999999', bgOpacity: 0.15, fgColor: '#000000',
  });

  iconDataObj[name] = {
    svg: svgStatic,
    hasAnim: !!anim,
  };

  // Store frame data for JS animation
  if (anim) {
    animDataObj[name] = anim.frames;
  }

  const animAttr = anim ? ' data-anim="true"' : '';
  return `<div class="icon-card" data-name="${name}"${animAttr} role="img" aria-label="${name} icon">
      ${svg}
      <div class="icon-name copyable" data-copy="${name}">${name}</div>
      <div class="icon-class copyable" data-copy="bi bi-${name}">bi bi-${name}</div>
    </div>`;
}).join('\n    ');

const displayCount = iconNames.filter(n => n !== 'bit-icons').length;

// Landing hero icons
const heroNames = ['settings','heart','star','search','mail','bell','chart','globe','shield','zap','factory','truck','thumbs-up','code','users','camera'];
const heroIcons = heroNames.map(name => {
  if (!icons[name]) return '';
  const anim = getAnimation(name);
  const svg = gridToSvg(icons[name], {
    bgColor: '#999999', bgOpacity: 0.15, fgColor: '#111111',
    animatable: true,
  });
  const animAttr = anim ? ' data-anim="true"' : '';
  return `<div class="hero-icon" data-name="${name}"${animAttr}>${svg}</div>`;
}).join('\n      ');

const unicodeRows = iconNames.filter(n => n !== 'bit-icons').map((name, i) => {
  const code = 0xE001 + i;
  return `<tr>
        <td><code>bi-${name}</code></td>
        <td><code>\\${code.toString(16)}</code></td>
        <td><code>&amp;#x${code.toString(16)};</code></td>
      </tr>`;
}).join('\n      ');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>bit-icons &mdash; ${displayCount} dot-grid icons</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <meta name="description" content="Free open-source dot-grid icon library. 215+ pixel-perfect icons on a 7x7 grid with frame-based animations. Available via npm, CDN, or SVG download.">
  <meta name="keywords" content="icons, pixel art, dot grid, svg icons, icon library, open source, free icons, bit-icons, animated icons">
  <meta property="og:title" content="bit-icons — 215+ dot-grid icons">
  <meta property="og:description" content="Free open-source dot-grid icon library. 215+ pixel-perfect icons on a 7x7 grid with frame-based animations. Available via npm, CDN, or SVG download.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://bit-icons.vercel.app/">
  <meta property="og:image" content="https://bit-icons.vercel.app/favicon.svg">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="bit-icons — 215+ dot-grid icons">
  <meta name="twitter:description" content="Free open-source dot-grid icon library. 215+ pixel-perfect icons on a 7x7 grid with frame-based animations. Available via npm, CDN, or SVG download.">
  <link rel="canonical" href="https://bit-icons.vercel.app/">
  <meta name="robots" content="index, follow">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "bit-icons",
    "description": "Free open-source dot-grid icon library. 215+ pixel-perfect icons on a 7x7 grid with frame-based animations.",
    "url": "https://bit-icons.vercel.app/",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Bethan Dutton",
      "url": "https://www.linkedin.com/in/bethandutton/"
    },
    "license": "https://opensource.org/licenses/MIT",
    "codeRepository": "https://github.com/bethandutton/bit-icons",
    "programmingLanguage": ["JavaScript", "CSS", "SVG"],
    "softwareVersion": "${version}"
  }
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
      color: #111111;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Banner */
    .banner {
      background: #111111;
      color: #999;
      text-align: center;
      padding: 0.4rem;
      font-size: 0.75rem;
    }
    .banner strong { color: #ffffff; }

    /* Logo */
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    .logo svg { width: 32px; height: 32px; }
    .logo span { font-weight: 700; font-size: 1.4rem; }

    /* Landing */
    .landing {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 30px);
      padding: 2rem;
      text-align: center;
    }
    .landing .logo svg { width: 56px; height: 56px; }
    .landing .logo span { font-size: 3rem; letter-spacing: -0.02em; }
    .landing .logo { margin-bottom: 0.5rem; }
    .landing .tagline {
      font-size: 1.1rem;
      color: #888;
      margin-bottom: 2rem;
    }

    /* Hero icon grid */
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(8, 48px);
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }
    .hero-icon svg {
      width: 48px;
      height: 48px;
      opacity: 0.25;
      transition: opacity 0.2s, transform 0.2s;
    }
    .hero-icon:hover svg {
      opacity: 1;
      transform: scale(1.15);
    }

    .landing-search {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      max-width: 480px;
    }
    .landing-search input {
      flex: 1;
      padding: 0.85rem 1.25rem;
      font-size: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      outline: none;
      background: white;
    }
    .landing-search input:focus { border-color: #588157; }
    .landing-search button {
      padding: 0.85rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      background: #111111;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .landing-search button:hover { background: #333; }
    .landing-count { margin-top: 1rem; font-size: 0.85rem; color: #888; }
    .landing-nav {
      margin-top: 2rem;
      display: flex;
      gap: 1.5rem;
    }
    .landing-nav a {
      color: #888;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .landing-nav a:hover { color: #111; }

    /* App */
    .app { display: none; padding: 2rem 0; }
    .app.active { display: block; }
    .app-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      position: relative;
    }
    .colour-picker {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    .colour-picker input[type="color"] {
      width: 24px; height: 24px; border: 2px solid #e0e0e0;
      border-radius: 50%; cursor: pointer; background: none; padding: 1px;
      -webkit-appearance: none; appearance: none;
    }
    .colour-picker input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    .colour-picker input[type="color"]::-webkit-color-swatch { border: none; border-radius: 50%; }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 1.5rem;
      justify-content: center;
      background: #f0f0f0;
      border-radius: 8px;
      padding: 3px;
      display: inline-flex;
    }
    .tabs-wrap { text-align: center; margin-bottom: 1.5rem; }
    .tab {
      padding: 0.5rem 1.25rem;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      color: #666;
      border-radius: 6px;
      transition: all 0.15s;
      user-select: none;
    }
    .tab:hover { color: #333; }
    .tab.active { color: #111; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Search */
    .search-wrap { margin-bottom: 1.5rem; text-align: center; }
    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 0.6rem 1rem;
      font-size: 0.95rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      outline: none;
      background: white;
    }
    .search-input:focus { border-color: #588157; }
    .search-count { font-size: 0.8rem; color: #888; margin-top: 0.5rem; }

    /* Icon grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.5rem;
    }
    .icon-card {
      position: relative;
      background: transparent;
      border-radius: 8px;
      padding: 1.25rem 0.75rem;
      text-align: center;
      transition: background 0.15s;
    }
    .icon-card:hover { background: #f5f5f5; }
    .icon-card.hidden { display: none; }
    .icon-card svg {
      width: 56px; height: 56px;
      margin: 0 auto 0.6rem;
      display: block;
    }
    .dl-btn {
      position: absolute; top: 6px; right: 6px;
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; color: #888; text-decoration: none;
      border-radius: 4px;
      opacity: 0; transition: opacity 0.15s, background 0.15s;
    }
    .icon-card:hover .dl-btn { opacity: 1; }
    .dl-btn:hover { background: #e0e0e0; color: #111; }

    /* Copyable text */
    .copyable {
      cursor: pointer;
      border-radius: 3px;
      padding: 0.1em 0.2em;
      transition: background 0.15s, color 0.15s;
      position: relative;
    }
    .copyable:hover { background: #e0e0e0; }
    .copyable.copied {
      background: #111111;
      color: white;
    }
    .icon-name { font-size: 0.75rem; font-family: monospace; color: #555; }
    .icon-class { font-size: 0.65rem; font-family: monospace; color: #888; margin-top: 0.2rem; }

    /* Toast */
    .toast {
      position: fixed; bottom: 2rem; left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #111; color: #eee;
      padding: 0.5rem 1.25rem; border-radius: 6px;
      font-size: 0.85rem; opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none; z-index: 100;
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Sections */
    .section {
      background: #f5f5f5; border-radius: 8px;
      padding: 1.5rem; margin-bottom: 1.5rem;
      border: 1px solid #e0e0e0;
    }
    .section h2 { font-size: 1.15rem; margin-bottom: 0.75rem; }
    .section h3 { font-size: 0.95rem; margin: 1.25rem 0 0.5rem; }
    .section p { font-size: 0.9rem; line-height: 1.6; color: #555; margin-bottom: 0.5rem; }
    pre {
      background: #f0f0f0; color: #333;
      padding: 1rem; border-radius: 6px;
      overflow-x: auto; font-size: 0.85rem; margin: 0.5rem 0;
    }
    code { background: #f0f0f0; padding: 0.15em 0.4em; border-radius: 3px; font-size: 0.85rem; }
    pre code { background: none; padding: 0; }
    .download-btn {
      display: inline-block; padding: 0.6rem 1.25rem;
      background: #111111; color: white; text-decoration: none;
      border-radius: 6px; font-size: 0.9rem; font-weight: 500;
      margin-top: 0.5rem; border: none; cursor: pointer;
    }
    .download-btn:hover { background: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.85rem; }
    th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid #e0e0e0; font-weight: 600; color: #555; }
    td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #f0f0f0; }
    tr:hover td { background: #fafafa; }

    /* All animation is JS frame-based — no CSS keyframes needed */

    /* Modal */
    .modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.5); z-index: 200;
      align-items: center; justify-content: center;
    }
    .modal-overlay.active { display: flex; }
    .modal {
      background: #ffffff; border-radius: 12px; padding: 2rem;
      max-width: 520px; width: 90%; position: relative;
      max-height: 90vh; overflow-y: auto;
    }
    .modal-close {
      position: absolute; top: 0.75rem; right: 1rem;
      background: none; border: none; font-size: 1.5rem;
      cursor: pointer; color: #888;
    }
    .modal-close:hover { color: #111; }
    .modal-preview { text-align: center; padding: 1.5rem 0; }
    .modal-preview svg { width: 120px; height: 120px; }
    .modal-name { text-align: center; font-family: monospace; font-size: 1.1rem; color: #111; margin-bottom: 1rem; }
    .modal-toggle {
      display: flex; justify-content: center; margin-bottom: 1.25rem; gap: 0;
    }
    .toggle-btn {
      padding: 0.45rem 1.25rem; border: 1px solid #e0e0e0;
      background: #f5f5f5; cursor: pointer; font-size: 0.85rem; color: #555;
    }
    .toggle-btn:first-child { border-radius: 6px 0 0 6px; }
    .toggle-btn:last-child { border-radius: 0 6px 6px 0; }
    .toggle-btn.active { background: #111111; color: white; border-color: #588157; }
    .modal-colours {
      display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.25rem;
    }
    .modal-colours label {
      display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
      font-size: 0.75rem; color: #888;
    }
    .modal-colours input[type="color"] {
      width: 36px; height: 36px; border: 2px solid #e0e0e0; border-radius: 6px;
      cursor: pointer; background: none; padding: 2px;
    }
    .modal-section { margin-bottom: 1rem; }
    .modal-section h4 { font-size: 0.8rem; color: #888; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .modal-downloads { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
    .modal-downloads .download-btn { font-size: 0.8rem; padding: 0.5rem 1rem; }

    /* Icon card cursor */
    .icon-card { cursor: pointer; }
  </style>
</head>
<body>

  <div class="banner">
    <strong>bit-icons v${version}</strong> &mdash; Last updated ${buildDate} &mdash; ${displayCount} icons
  </div>

  <!-- Landing -->
  <div class="landing" id="landing">
    <div class="logo" id="landing-logo">
      ${logoSvg}
      <span>bit-icons</span>
    </div>
    <p class="tagline">Pixel-perfect dot-grid icons for the modern web</p>

    <div class="hero-grid">
      ${heroIcons}
    </div>

    <div class="landing-search">
      <input type="text" id="landing-search-input" placeholder="Search ${displayCount} icons...">
      <button id="landing-search-btn">Search</button>
    </div>
    <p class="landing-count">${displayCount} free icons &mdash; MIT licensed</p>
    <div class="landing-nav">
      <a href="#" data-goto="icons">All Icons</a>
      <a href="#" data-goto="support">Support</a>
      <a href="#" data-goto="license">License</a>
    </div>
  </div>

  <!-- App -->
  <div class="app" id="app">
    <div class="container">
    <div class="app-header">
      <div class="logo" id="back-home">
        ${logoSvg}
        <span>bit-icons</span>
      </div>
      <div class="colour-picker">
        <input type="color" id="icon-colour" value="#111111" title="Icon colour">
      </div>
    </div>

    <div class="tabs-wrap">
      <div class="tabs">
        <div class="tab active" data-tab="icons">Icons</div>
        <div class="tab" data-tab="support">Support</div>
        <div class="tab" data-tab="license">License</div>
        <div class="tab" data-tab="changelog">Changelog</div>
        <div class="tab" data-tab="about">About</div>
      </div>
    </div>

    <div class="tab-content active" id="tab-icons">
      <div class="search-wrap">
        <input type="text" class="search-input" placeholder="Search icons..." id="search">
        <div class="search-count" id="search-count">${displayCount} icons</div>
      </div>
      <div class="grid" id="icon-grid">
        ${iconCards}
      </div>
    </div>

    <div class="tab-content" id="tab-support">
      <div class="section">
        <h2>Getting Started</h2>
        <p>bit-icons can be used via CSS classes, inline SVGs, or as a web font.</p>

        <h3>1. CSS (Recommended)</h3>
        <pre><code>&lt;link rel="stylesheet" href="bit-icons.css"&gt;

&lt;span class="bi bi-heart"&gt;&lt;/span&gt;
&lt;span class="bi bi-search"&gt;&lt;/span&gt;
&lt;span class="bi bi-settings"&gt;&lt;/span&gt;</code></pre>

        <h3>2. Inline SVG</h3>
        <pre><code>&lt;img src="svg/heart.svg" alt="heart" width="24"&gt;</code></pre>

        <h3>3. JavaScript</h3>
        <pre><code>import bitIcons from 'bit-icons';
console.log(bitIcons.heart); // 7x7 grid array</code></pre>
      </div>

      <div class="section">
        <h2>Font Download</h2>
        <p>Download the bit-icons typeface to use icons as font glyphs in any design tool or application.</p>
        <button class="download-btn" id="download-font">Download bit-icons.woff2</button>
        <p style="margin-top:0.75rem;font-size:0.8rem;color:#6b7c5e;">Font build coming soon. Use CSS or SVG methods in the meantime.</p>

        <h3>Using the Font</h3>
        <pre><code>@font-face {
  font-family: 'bit-icons';
  src: url('bit-icons.woff2') format('woff2');
}
.bi {
  font-family: 'bit-icons';
  font-style: normal;
  speak: none;
  -webkit-font-smoothing: antialiased;
}</code></pre>

        <h3>Sizing &amp; Coloring</h3>
        <p>Icons scale with <code>font-size</code> and inherit <code>color</code>. Background grid renders at 10% opacity.</p>
        <pre><code>&lt;span class="bi bi-heart" style="color:red; font-size:2rem;"&gt;&lt;/span&gt;</code></pre>
      </div>

      <div class="section">
        <h2>Install via npm</h2>
        <pre><code>npm install bit-icons</code></pre>
        <pre><code>import 'bit-icons/dist/bit-icons.css';</code></pre>
      </div>

      <div class="section">
        <h2>CDN</h2>
        <pre><code>&lt;link rel="stylesheet" href="https://unpkg.com/bit-icons@${version}/dist/bit-icons.css"&gt;</code></pre>
      </div>

      <div class="section">
        <h2>Unicode Reference</h2>
        <table>
          <thead><tr><th>Class</th><th>CSS Content</th><th>HTML Entity</th></tr></thead>
          <tbody>${unicodeRows}</tbody>
        </table>
      </div>
    </div>

    <div class="tab-content" id="tab-license">
      <div class="section">
        <h2>License</h2>
        <p><strong>bit-icons is free for personal and commercial use.</strong></p>
        <p>Use bit-icons in websites, apps, SaaS products, templates, themes, prints, merchandise — anything. No license key, no sign-up, no attribution required.</p>

        <h3>MIT License</h3>
        <pre><code>MIT License

Copyright (c) 2026 bit-icons

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED.</code></pre>
      </div>
    </div>

    <div class="tab-content" id="tab-about">
      <div class="section">
        <h2>What is bit-icons?</h2>
        <p>bit-icons is a free, curated collection of design assets built for designers and developers. ${displayCount}+ pixel-perfect icons rendered on a 7x7 dot grid, each crafted as portrait-shaped rectangles with a distinctive retro aesthetic.</p>
        <p>Every icon comes with frame-based animations inspired by old LED and dot-matrix displays — where individual dots flip on and off to create the illusion of movement. Available as static SVGs, animated GIFs, CSS classes, or raw grid data you can use however you like.</p>
        <p>Whether you need iconography for a website, app, presentation, or print — bit-icons is a ready-made design system you can drop straight into any project. No subscriptions, no watermarks, no strings attached.</p>

        <h2>What you get</h2>
        <p><strong>${displayCount}+ curated icons</strong> covering UI, arrows, communication, business, manufacturing, brands, status indicators, data visualisation, and more.</p>
        <p><strong>Multiple formats</strong> — SVG, CSS, JavaScript, and animated GIF. Use them however your project needs.</p>
        <p><strong>Customisable</strong> — icons inherit your text colour and scale with font-size. Change the icon colour, background, and grid colour before downloading.</p>
        <p><strong>Animated</strong> — every icon has a unique frame-based animation. Download as a GIF or implement the animation in your own code.</p>

        <h2>How to Use</h2>

        <h3>Install via npm</h3>
        <pre><code>npm install bit-icons</code></pre>

        <h3>Use via CDN</h3>
        <pre><code>&lt;link rel="stylesheet" href="https://unpkg.com/bit-icons/dist/bit-icons.css"&gt;

&lt;span class="bi bi-heart"&gt;&lt;/span&gt;</code></pre>

        <h3>Individual SVGs</h3>
        <p>Every icon is available as a standalone SVG in the <code>dist/svg/</code> folder, ready to drop into any project.</p>

        <h2>Links</h2>
        <p><a href="https://github.com/bethandutton/bit-icons" target="_blank">GitHub</a> &middot; <a href="https://www.npmjs.com/package/bit-icons" target="_blank">npm</a></p>

        <h2>Author</h2>
        <p>Built by <a href="https://www.linkedin.com/in/bethandutton/" target="_blank">Bethan Dutton</a>. Icon designs by the brand team at Lleverage.</p>

        <h2>Free for Everyone</h2>
        <p>bit-icons is completely free and open source under the MIT licence. Use them in personal projects, commercial products, SaaS apps, client work, templates, merchandise — anything. No attribution required, no sign-up, no licence key. Just grab them and go.</p>
      </div>
    </div>

    <div class="tab-content" id="tab-changelog">
      <div class="section">
        ${changelogHtml}
      </div>
    </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <button class="modal-close" id="modal-close">&times;</button>
      <div class="modal-preview" id="modal-preview"></div>
      <div class="modal-name" id="modal-name"></div>
      <div class="modal-toggle">
        <button class="toggle-btn active" data-mode="static">Static</button>
        <button class="toggle-btn" data-mode="animated">Animated</button>
      </div>
      <div class="modal-colours">
        <label><span>Background</span><input type="color" id="modal-bg-colour" value="#ffffff"></label>
        <label><span>Icon</span><input type="color" id="modal-fg-colour" value="#111111"></label>
        <label><span>Grid</span><input type="color" id="modal-grid-colour" value="#999999"></label>
      </div>
      <div class="modal-section">
        <h4>HTML</h4>
        <pre><code id="modal-html"></code></pre>
      </div>
      <div class="modal-section">
        <h4>CSS Class</h4>
        <pre><code id="modal-class"></code></pre>
      </div>
      <div class="modal-section">
        <h4>CDN</h4>
        <pre><code id="modal-cdn"></code></pre>
      </div>
      <div class="modal-section" id="modal-anim-section" style="display:none;">
        <h4>Animated (JS)</h4>
        <pre><code id="modal-anim-code"></code></pre>
      </div>
      <div class="modal-downloads">
        <a class="download-btn" id="dl-static">Download SVG</a>
        <a class="download-btn" id="dl-animated" style="background:#333;">Download GIF</a>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const iconData = ${JSON.stringify(iconDataObj)};
    const animData = ${JSON.stringify(animDataObj)};
  </script>

  <script>
    const landing = document.getElementById('landing');
    const app = document.getElementById('app');
    const searchInput = document.getElementById('search');
    const landingInput = document.getElementById('landing-search-input');
    const cards = document.querySelectorAll('.icon-card');
    const countEl = document.getElementById('search-count');
    const toast = document.getElementById('toast');
    const colourPicker = document.getElementById('icon-colour');
    let toastTimer;
    let currentFgColour = '#111111';
    const bgColour = '#999999';
    const bgOpacity = '0.15';

    // Colour picker — changes all foreground rects, keeps bg grey
    colourPicker.addEventListener('input', (e) => {
      currentFgColour = e.target.value;
      document.querySelectorAll('.icon-card svg rect[data-r], .hero-icon svg rect[data-r]').forEach(rect => {
        if (!rect.getAttribute('opacity')) {
          rect.setAttribute('fill', currentFgColour);
        }
      });
    });

    // ── Frame-based animation engine ──
    const activeAnimations = new Map(); // element -> intervalId

    function applyFrame(container, frame, opts) {
      const fg = opts && opts.fg || currentFgColour;
      const bg = opts && opts.bg || bgColour;
      const op = opts && opts.opacity || bgOpacity;
      const rects = container.querySelectorAll('svg rect[data-r]');
      rects.forEach(rect => {
        const r = parseInt(rect.dataset.r);
        const c = parseInt(rect.dataset.c);
        const on = frame[r] && frame[r][c] === 1;
        if (on) {
          rect.setAttribute('fill', fg);
          rect.removeAttribute('opacity');
        } else {
          rect.setAttribute('fill', bg);
          rect.setAttribute('opacity', op);
        }
      });
    }

    function startAnimation(container, name) {
      const frames = animData[name];
      if (!frames || frames.length < 2) return;
      let frameIndex = 0;
      const speed = 300;
      const intervalId = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        applyFrame(container, frames[frameIndex]);
      }, speed);
      activeAnimations.set(container, intervalId);
    }

    function stopAnimation(container, name) {
      const intervalId = activeAnimations.get(container);
      if (intervalId) {
        clearInterval(intervalId);
        activeAnimations.delete(container);
      }
      // Reset to frame 0 (the base icon)
      const frames = animData[name];
      if (frames) applyFrame(container, frames[0]);
    }

    // Hover animation on icon cards
    cards.forEach(card => {
      const name = card.dataset.name;
      if (!animData[name]) return;
      card.addEventListener('mouseenter', () => startAnimation(card, name));
      card.addEventListener('mouseleave', () => stopAnimation(card, name));
    });

    // Hover animation on hero icons
    document.querySelectorAll('.hero-icon[data-name]').forEach(hero => {
      const name = hero.dataset.name;
      if (!animData[name]) return;
      hero.addEventListener('mouseenter', () => startAnimation(hero, name));
      hero.addEventListener('mouseleave', () => stopAnimation(hero, name));
    });

    function showApp(tab, query) {
      landing.style.display = 'none';
      app.classList.add('active');
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
      if (query) { searchInput.value = query; filterIcons(query); }
      if (tab === 'icons') searchInput.focus();
    }

    function filterIcons(q) {
      q = q.toLowerCase().trim();
      let visible = 0;
      cards.forEach(card => {
        const match = !q || card.dataset.name.includes(q);
        card.classList.toggle('hidden', !match);
        if (match) visible++;
      });
      countEl.textContent = visible + ' icon' + (visible !== 1 ? 's' : '');
    }

    function showToast(text) {
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
    }

    // Landing search
    document.getElementById('landing-search-btn').addEventListener('click', () => showApp('icons', landingInput.value));
    landingInput.addEventListener('keydown', e => { if (e.key === 'Enter') showApp('icons', landingInput.value); });

    // Landing nav
    document.querySelectorAll('.landing-nav a').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); showApp(a.dataset.goto, ''); });
    });

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      });
    });

    // App search
    searchInput.addEventListener('input', () => filterIcons(searchInput.value));

    // Back to landing
    document.getElementById('back-home').addEventListener('click', () => {
      app.classList.remove('active');
      landing.style.display = '';
    });

    // Copy to clipboard with inline feedback
    document.querySelectorAll('.copyable').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = el.dataset.copy;
        const original = el.textContent;
        navigator.clipboard.writeText(text).then(() => {
          el.textContent = 'copied!';
          el.classList.add('copied');
          showToast('Copied: ' + text);
          setTimeout(() => {
            el.textContent = original;
            el.classList.remove('copied');
          }, 1200);
        });
      });
    });

    // Modal
    const modalOverlay = document.getElementById('modal-overlay');
    const modalPreview = document.getElementById('modal-preview');
    const modalName = document.getElementById('modal-name');
    const modalHtml = document.getElementById('modal-html');
    const modalClass = document.getElementById('modal-class');
    const modalCdn = document.getElementById('modal-cdn');
    const dlStatic = document.getElementById('dl-static');
    const dlAnimated = document.getElementById('dl-animated');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    let currentIcon = null;
    let currentMode = 'static';
    let modalAnimInterval = null;
    const modalBgPicker = document.getElementById('modal-bg-colour');
    const modalFgPicker = document.getElementById('modal-fg-colour');
    const modalGridPicker = document.getElementById('modal-grid-colour');
    let modalBgColour = '#ffffff';
    let modalFgColour = '#111111';
    let modalGridColour = '#999999';

    function updateModalColours() {
      modalBgColour = modalBgPicker.value;
      modalFgColour = modalFgPicker.value;
      modalGridColour = modalGridPicker.value;
      // Update preview background
      modalPreview.style.background = modalBgColour;
      modalPreview.style.borderRadius = '8px';
      // Update preview rects
      const rects = modalPreview.querySelectorAll('svg rect[data-r]');
      rects.forEach(rect => {
        if (rect.getAttribute('opacity')) {
          rect.setAttribute('fill', modalGridColour);
        } else {
          rect.setAttribute('fill', modalFgColour);
        }
      });
    }

    modalBgPicker.addEventListener('input', updateModalColours);
    modalFgPicker.addEventListener('input', updateModalColours);
    modalGridPicker.addEventListener('input', updateModalColours);

    function buildModalSvg(name) {
      // Build an animatable SVG for the modal preview
      const base = animData[name] ? animData[name][0] : null;
      // Use the static SVG from iconData but make it bigger
      const container = document.createElement('div');
      container.innerHTML = iconData[name].svg;
      return container.innerHTML;
    }

    function openModal(name) {
      currentIcon = name;
      currentMode = 'static';
      stopModalAnim();

      const data = iconData[name];
      const hasAnim = !!animData[name];

      // Create an animatable SVG for the modal
      // We need data-r/data-c attributes, so build from frame data
      if (hasAnim) {
        const frames = animData[name];
        // Build SVG with all dot positions and data attributes
        let rects = '';
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 7; c++) {
            if ((r===0&&c===0)||(r===0&&c===6)||(r===6&&c===0)||(r===6&&c===6)) continue;
            const x = 5 + c * 10 - 1.5;
            const y = 5 + r * 10 - 3.5;
            const on = frames[0][r][c] === 1;
            if (on) {
              rects += '<rect x="'+x+'" y="'+y+'" width="3" height="7" fill="'+currentFgColour+'" data-r="'+r+'" data-c="'+c+'"/>';
            } else {
              rects += '<rect x="'+x+'" y="'+y+'" width="3" height="7" fill="'+bgColour+'" opacity="'+bgOpacity+'" data-r="'+r+'" data-c="'+c+'"/>';
            }
          }
        }
        modalPreview.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" width="70" height="70">' + rects + '</svg>';
      } else {
        modalPreview.innerHTML = data.svg;
      }

      modalName.textContent = name;
      modalHtml.textContent = '<span class="bi bi-' + name + '"></span>';
      modalClass.textContent = 'bi bi-' + name;
      modalCdn.textContent = '<link rel="stylesheet" href="https://unpkg.com/bit-icons/dist/bit-icons.css">\\n<span class="bi bi-' + name + '"></span>';

      // Animated usage
      const animSection = document.getElementById('modal-anim-section');
      const animCode = document.getElementById('modal-anim-code');
      if (hasAnim) {
        animSection.style.display = '';
        animCode.textContent = "import { getAnimation } from 'bit-icons/src/animations';\\n\\nconst anim = getAnimation('" + name + "');\\n// anim.frames = array of 7x7 grids\\n// anim.speed = 300 (ms per frame)\\n\\nlet i = 0;\\nsetInterval(() => {\\n  i = (i + 1) % anim.frames.length;\\n  // Update your dots based on anim.frames[i]\\n}, anim.speed);";
      } else {
        animSection.style.display = 'none';
      }

      // Static download
      dlStatic.href = 'data:image/svg+xml;base64,' + btoa(data.svg);
      dlStatic.download = name + '.svg';

      // Animated GIF download
      if (hasAnim) {
        dlAnimated.style.display = '';
        dlAnimated.download = name + '.gif';
        dlAnimated.onclick = function(e) {
          e.preventDefault();
          generateGIF(name, function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name + '.gif';
            a.click();
            URL.revokeObjectURL(url);
          });
        };
      } else {
        dlAnimated.style.display = 'none';
        dlAnimated.onclick = null;
      }

      // Toggle buttons
      toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === 'static'));
      toggleBtns[1].style.display = hasAnim ? '' : 'none';

      modalOverlay.classList.add('active');
    }

    // ── GIF Encoder ──
    function generateGIF(name, callback) {
      const frames = animData[name];
      if (!frames) return;

      const scale = 4; // 70 * 4 = 280px output
      const gridSize = 7;
      const colSpacing = 10;
      const rowSpacing = 10;
      const dotW = 3;
      const dotH = 7;
      const viewSize = 70;
      const imgSize = viewSize * scale;

      const excluded = new Set(['0,0','0,6','6,0','6,6']);

      // Build palette from modal colours
      function hexToRgb(hex) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return [r, g, b];
      }
      const bgRgb = hexToRgb(modalBgColour);
      const gridRgb = hexToRgb(modalGridColour);
      // Blend grid colour with bg at 15% opacity
      const blendedGrid = [
        Math.round(gridRgb[0] * 0.15 + bgRgb[0] * 0.85),
        Math.round(gridRgb[1] * 0.15 + bgRgb[1] * 0.85),
        Math.round(gridRgb[2] * 0.15 + bgRgb[2] * 0.85),
      ];
      const fgRgb = hexToRgb(modalFgColour);
      const gifPalette = [...bgRgb, ...blendedGrid, ...fgRgb, 0, 0, 0]; // 4 entries (power of 2)

      // Render each frame to a pixel array
      const pixelFrames = frames.map(frame => {
        const canvas = document.createElement('canvas');
        canvas.width = imgSize;
        canvas.height = imgSize;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = modalBgColour;
        ctx.fillRect(0, 0, imgSize, imgSize);

        const offsetX = colSpacing / 2;
        const offsetY = rowSpacing / 2;

        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            if (excluded.has(r+','+c)) continue;
            const cx = offsetX + c * colSpacing;
            const cy = offsetY + r * rowSpacing;
            const x = (cx - dotW / 2) * scale;
            const y = (cy - dotH / 2) * scale;
            const w = dotW * scale;
            const h = dotH * scale;

            const on = frame[r] && frame[r][c] === 1;
            if (on) {
              ctx.fillStyle = modalFgColour;
              ctx.globalAlpha = 1;
            } else {
              ctx.fillStyle = modalGridColour;
              ctx.globalAlpha = 0.15;
            }
            ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
          }
        }
        ctx.globalAlpha = 1;

        // Get pixel data and find closest palette colour
        const imageData = ctx.getImageData(0, 0, imgSize, imgSize);
        const pixels = new Array(imgSize * imgSize);
        for (let i = 0; i < pixels.length; i++) {
          const pr = imageData.data[i * 4];
          const pg = imageData.data[i * 4 + 1];
          const pb = imageData.data[i * 4 + 2];
          // Find closest palette entry
          let best = 0, bestDist = Infinity;
          for (let p = 0; p < 3; p++) {
            const dr = pr - gifPalette[p*3], dg = pg - gifPalette[p*3+1], db = pb - gifPalette[p*3+2];
            const dist = dr*dr + dg*dg + db*db;
            if (dist < bestDist) { bestDist = dist; best = p; }
          }
          pixels[i] = best;
        }
        return pixels;
      });

      const gifBytes = encodeGIF(pixelFrames, imgSize, imgSize, 300, gifPalette);
      const blob = new Blob([gifBytes], { type: 'image/gif' });
      callback(blob);
    }

    ${gifEncoderSrc}

    function modalColourOpts() {
      return { fg: modalFgColour, bg: modalGridColour, opacity: bgOpacity };
    }

    function startModalAnim() {
      if (!currentIcon || !animData[currentIcon]) return;
      const frames = animData[currentIcon];
      let fi = 0;
      modalAnimInterval = setInterval(() => {
        fi = (fi + 1) % frames.length;
        applyFrame(modalPreview, frames[fi], modalColourOpts());
      }, 300);
    }

    function stopModalAnim() {
      if (modalAnimInterval) {
        clearInterval(modalAnimInterval);
        modalAnimInterval = null;
      }
    }

    // Toggle static/animated in modal
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
        stopModalAnim();
        if (currentMode === 'animated') {
          // Reset to frame 0 first
          if (animData[currentIcon]) applyFrame(modalPreview, animData[currentIcon][0], modalColourOpts());
          startModalAnim();
        } else {
          // Reset to frame 0
          if (animData[currentIcon]) applyFrame(modalPreview, animData[currentIcon][0], modalColourOpts());
        }
      });
    });

    // Close modal
    function closeModal() {
      stopModalAnim();
      modalOverlay.classList.remove('active');
    }
    document.getElementById('modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Click icon card to open modal
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.copyable')) return;
        openModal(card.dataset.name);
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'cheatsheet.html'), html);
fs.writeFileSync(path.join(distDir, 'index.html'), html);
console.log(`Cheat sheet generated: ${displayCount} icons, v${version}, built ${buildDate}`);
