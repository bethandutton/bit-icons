const fs = require('fs');
const path = require('path');
const { gridToSvg } = require('../src/grid');
const icons = require('../src/icons');
const pkg = require('../package.json');

const distDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(distDir, { recursive: true });

const iconNames = Object.keys(icons);
const version = pkg.version;
const buildDate = new Date().toISOString().split('T')[0];

// Logo SVG from the bit-icons icon
const logoSvg = gridToSvg(icons['bit-icons'], { bgDots: true, bgOpacity: 0.1, fgColor: 'currentColor' });

// Build icon cards
const iconCards = iconNames.filter(n => n !== 'bit-icons').map(name => {
  const svg = gridToSvg(icons[name], { bgDots: true, bgOpacity: 0.1, fgColor: '#1a1a1a' });
  const svgDl = gridToSvg(icons[name], { bgDots: true, bgOpacity: 0.1, fgColor: '#000000' });
  const b64 = Buffer.from(svgDl).toString('base64');
  return `<div class="icon-card" data-name="${name}">
      <a class="dl-btn" href="data:image/svg+xml;base64,${b64}" download="${name}.svg" title="Download SVG">&#8681;</a>
      ${svg}
      <div class="icon-name copyable" data-copy="${name}">${name}</div>
      <div class="icon-class copyable" data-copy="bi bi-${name}">bi bi-${name}</div>
    </div>`;
}).join('\n    ');

const displayCount = iconNames.filter(n => n !== 'bit-icons').length;

// Landing hero icons — pick a nice spread for the animated grid
const heroNames = ['settings','heart','star','search','mail','bell','chart','globe','shield','zap','factory','truck','thumbs-up','code','users','camera'];
const heroIcons = heroNames.map(name => {
  if (!icons[name]) return '';
  const svg = gridToSvg(icons[name], { bgDots: true, bgOpacity: 0.1, fgColor: '#1a1a1a' });
  return `<div class="hero-icon">${svg}</div>`;
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
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f4;
      color: #1a1a1a;
    }

    /* Banner */
    .banner {
      background: #1a1a1a;
      color: #999;
      text-align: center;
      padding: 0.4rem;
      font-size: 0.75rem;
    }
    .banner strong { color: white; }

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
      color: #777;
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
    .landing-search input:focus { border-color: #999; }
    .landing-search button {
      padding: 0.85rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      background: #1a1a1a;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .landing-search button:hover { background: #333; }
    .landing-count { margin-top: 1rem; font-size: 0.85rem; color: #999; }
    .landing-nav {
      margin-top: 2rem;
      display: flex;
      gap: 1.5rem;
    }
    .landing-nav a {
      color: #555;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .landing-nav a:hover { color: #1a1a1a; }

    /* App */
    .app { display: none; padding: 2rem; }
    .app.active { display: block; }
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e5e5e5;
    }
    .tab {
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: #888;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: color 0.15s, border-color 0.15s;
      user-select: none;
    }
    .tab:hover { color: #555; }
    .tab.active { color: #1a1a1a; border-bottom-color: #1a1a1a; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Search */
    .search-wrap { margin-bottom: 1.5rem; }
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
    .search-input:focus { border-color: #999; }
    .search-count { font-size: 0.8rem; color: #999; margin-top: 0.5rem; }

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
    .icon-card:hover { background: white; }
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
      font-size: 14px; color: #999; text-decoration: none;
      border-radius: 4px;
      opacity: 0; transition: opacity 0.15s, background 0.15s;
    }
    .icon-card:hover .dl-btn { opacity: 1; }
    .dl-btn:hover { background: #e5e5e5; color: #333; }

    /* Copyable text */
    .copyable {
      cursor: pointer;
      border-radius: 3px;
      padding: 0.1em 0.2em;
      transition: background 0.15s, color 0.15s;
      position: relative;
    }
    .copyable:hover { background: #e5e5e5; }
    .copyable.copied {
      background: #1a1a1a;
      color: white;
    }
    .icon-name { font-size: 0.75rem; font-family: monospace; color: #555; }
    .icon-class { font-size: 0.65rem; font-family: monospace; color: #999; margin-top: 0.2rem; }

    /* Toast */
    .toast {
      position: fixed; bottom: 2rem; left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #1a1a1a; color: white;
      padding: 0.5rem 1.25rem; border-radius: 6px;
      font-size: 0.85rem; opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none; z-index: 100;
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Sections */
    .section {
      background: white; border-radius: 8px;
      padding: 1.5rem; margin-bottom: 1.5rem;
      border: 1px solid #e5e5e5;
    }
    .section h2 { font-size: 1.15rem; margin-bottom: 0.75rem; }
    .section h3 { font-size: 0.95rem; margin: 1.25rem 0 0.5rem; }
    .section p { font-size: 0.9rem; line-height: 1.6; color: #444; margin-bottom: 0.5rem; }
    pre {
      background: #1a1a1a; color: #e5e5e5;
      padding: 1rem; border-radius: 6px;
      overflow-x: auto; font-size: 0.85rem; margin: 0.5rem 0;
    }
    code { background: #f0f0f0; padding: 0.15em 0.4em; border-radius: 3px; font-size: 0.85rem; }
    pre code { background: none; padding: 0; }
    .download-btn {
      display: inline-block; padding: 0.6rem 1.25rem;
      background: #1a1a1a; color: white; text-decoration: none;
      border-radius: 6px; font-size: 0.9rem; font-weight: 500;
      margin-top: 0.5rem; border: none; cursor: pointer;
    }
    .download-btn:hover { background: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.85rem; }
    th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid #e5e5e5; font-weight: 600; color: #555; }
    td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #f0f0f0; }
    tr:hover td { background: #fafafa; }
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
    <div class="app-header">
      <div class="logo" id="back-home">
        ${logoSvg}
        <span>bit-icons</span>
      </div>
    </div>

    <div class="tabs">
      <div class="tab active" data-tab="icons">Icons</div>
      <div class="tab" data-tab="support">Support</div>
      <div class="tab" data-tab="license">License</div>
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
        <p style="margin-top:0.75rem;font-size:0.8rem;color:#999;">Font build coming soon. Use CSS or SVG methods in the meantime.</p>

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
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const landing = document.getElementById('landing');
    const app = document.getElementById('app');
    const searchInput = document.getElementById('search');
    const landingInput = document.getElementById('landing-search-input');
    const cards = document.querySelectorAll('.icon-card');
    const countEl = document.getElementById('search-count');
    const toast = document.getElementById('toast');
    let toastTimer;

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
      el.addEventListener('click', () => {
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
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'cheatsheet.html'), html);
fs.writeFileSync(path.join(distDir, 'index.html'), html);
console.log(`Cheat sheet generated: ${displayCount} icons, v${version}, built ${buildDate}`);
