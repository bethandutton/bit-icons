/**
 * bit-icons frame-based animations
 *
 * Animations work like old LED displays — the grey dot grid stays fixed,
 * and different dots turn "on" (black) each frame to create movement.
 *
 * Each animation is an array of 7x7 grid frames. The icon cycles through
 * these frames on hover. Frame 0 is always the static icon itself (added
 * automatically), so we only define the additional frames here.
 */

const icons = require('./icons');

// ── Helpers ──────────────────────────────────────

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

// Shift all filled dots in a direction, empty dots fill in behind
function shiftGrid(grid, dir) {
  const g = Array.from({ length: 7 }, () => Array(7).fill(0));
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (grid[r][c] !== 1) continue;
      let nr = r, nc = c;
      if (dir === 'right') nc = c + 1;
      if (dir === 'left')  nc = c - 1;
      if (dir === 'up')    nr = r - 1;
      if (dir === 'down')  nr = r + 1;
      if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7) {
        g[nr][nc] = 1;
      }
    }
  }
  return g;
}

// Shift only specific rows
function shiftRows(grid, dir, rowFilter) {
  const g = cloneGrid(grid);
  // Clear the rows we're shifting
  for (let r = 0; r < 7; r++) {
    if (!rowFilter(r)) continue;
    for (let c = 0; c < 7; c++) g[r][c] = 0;
  }
  // Place shifted
  for (let r = 0; r < 7; r++) {
    if (!rowFilter(r)) continue;
    for (let c = 0; c < 7; c++) {
      if (grid[r][c] !== 1) continue;
      let nr = r, nc = c;
      if (dir === 'right') nc = c + 1;
      if (dir === 'left')  nc = c - 1;
      if (dir === 'up')    nr = r - 1;
      if (dir === 'down')  nr = r + 1;
      if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7) {
        g[nr][nc] = 1;
      }
    }
  }
  return g;
}

// Generate shift animation frames (icon moves in direction then resets)
function shiftFrames(baseGrid, dir, steps = 2) {
  const frames = [];
  let current = baseGrid;
  for (let i = 0; i < steps; i++) {
    current = shiftGrid(current, dir);
    frames.push(current);
  }
  return frames;
}

// Bounce: shift 1 step in dir, then back (bob effect)
function bounceFrames(baseGrid, dir) {
  return [shiftGrid(baseGrid, dir)];
}

// Partial bounce: only some rows move
function partialBounceFrames(baseGrid, dir, rowFilter) {
  return [shiftRows(baseGrid, dir, rowFilter)];
}

// Blink: alternate between icon and empty
function blinkFrames(baseGrid) {
  const empty = Array.from({ length: 7 }, () => Array(7).fill(0));
  return [empty];
}

// Morph: transition from one icon to another
function morphFrames(targetGrid) {
  return [targetGrid];
}

// Pulse: slightly "expand" by filling adjacent empty cells for 1 frame
function pulseFrames(baseGrid) {
  const expanded = cloneGrid(baseGrid);
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (baseGrid[r][c] !== 1) continue;
      // Fill direct neighbours
      if (r > 0 && expanded[r-1][c] === 0) expanded[r-1][c] = 1;
      if (r < 6 && expanded[r+1][c] === 0) expanded[r+1][c] = 1;
      if (c > 0 && expanded[r][c-1] === 0) expanded[r][c-1] = 1;
      if (c < 6 && expanded[r][c+1] === 0) expanded[r][c+1] = 1;
    }
  }
  return [expanded];
}

// ── Animation Definitions ──────────────────────────────────────

function getFrames(name) {
  const base = icons[name];
  if (!base) return null;

  switch (name) {
    // Arrows — shift in their direction then reset
    case 'arrow-right':
    case 'chevron-right':
    case 'send':
    case 'logout':
    case 'export':
    case 'external-link':
      return shiftFrames(base, 'right', 2);

    case 'arrow-left':
    case 'chevron-left':
    case 'reply':
    case 'login':
    case 'import':
      return shiftFrames(base, 'left', 2);

    case 'arrow-up':
    case 'chevron-up':
    case 'upload':
    case 'trending-up':
      return shiftFrames(base, 'up', 2);

    case 'arrow-down':
    case 'chevron-down':
    case 'trending-down':
      return shiftFrames(base, 'down', 2);

    // Download — arrow part moves down, bottom line stays
    case 'download':
      return partialBounceFrames(base, 'down', r => r < 5);

    // Bell, alert — bob up then back
    case 'bell':
    case 'alert':
    case 'warning':
    case 'announcement':
      return bounceFrames(base, 'up');

    // Shake — bob left then right
    case 'mail':
    case 'error':
    case 'cart':
    case 'trash':
    case 'phone':
    case 'urgent':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')];

    // Pulse — expand then contract
    case 'heart':
    case 'star':
    case 'target':
    case 'broadcast':
    case 'wifi':
    case 'record':
    case 'mic':
    case 'volume':
      return pulseFrames(base);

    // Blink — flash on/off
    case 'zap':
    case 'power':
    case 'bluetooth':
    case 'plug':
    case 'cursor':
      return blinkFrames(base);

    // Eye blink — close then open
    case 'eye':
      if (icons['eye-off']) return morphFrames(icons['eye-off']);
      return blinkFrames(base);

    // Lock/unlock morph
    case 'unlock':
      if (icons['lock']) return morphFrames(icons['lock']);
      return null;
    case 'lock':
      if (icons['unlock']) return morphFrames(icons['unlock']);
      return null;

    // Play/pause morph
    case 'play':
      if (icons['pause']) return morphFrames(icons['pause']);
      return null;
    case 'pause':
      if (icons['play']) return morphFrames(icons['play']);
      return null;

    // Eye toggle
    case 'eye-off':
      if (icons['eye']) return morphFrames(icons['eye']);
      return null;

    // Expand/collapse morph
    case 'expand':
      if (icons['collapse']) return morphFrames(icons['collapse']);
      return pulseFrames(base);
    case 'collapse':
      if (icons['expand']) return morphFrames(icons['expand']);
      return null;

    // Check/approved — grow in
    case 'check':
    case 'approved':
    case 'complete':
      return pulseFrames(base);

    // Refresh, settings — the icon shifts around to simulate rotation
    case 'refresh':
    case 'settings':
    case 'clock':
    case 'stopwatch':
    case 'compass':
      return [shiftGrid(base, 'right'), shiftGrid(shiftGrid(base, 'right'), 'down'),
              shiftGrid(base, 'down'), shiftGrid(shiftGrid(base, 'down'), 'left')];

    // Globe, sun — rotate feel
    case 'globe':
    case 'sun':
      return [shiftGrid(base, 'right'), shiftGrid(base, 'down'), shiftGrid(base, 'left')];

    // Float — bob up then back
    case 'cloud':
    case 'moon':
    case 'robot':
      return bounceFrames(base, 'up');

    // Swing — left then right
    case 'flag':
    case 'key':
    case 'tag':
    case 'bookmark':
    case 'music':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')];

    // Search — grow
    case 'search':
    case 'maximize':
    case 'grow':
      return pulseFrames(base);

    // Pin, anchor — drop down
    case 'pin':
    case 'anchor':
      return bounceFrames(base, 'down');

    // ── UI ──
    case 'home':
      return bounceFrames(base, 'down'); // settle into place
    case 'user':
      return bounceFrames(base, 'up'); // wave
    case 'close':
      return [shiftGrid(base, 'right'), shiftGrid(base, 'down'), shiftGrid(base, 'left')]; // spin feel
    case 'plus':
      return pulseFrames(base); // grow
    case 'minus':
      return blinkFrames(base); // flash
    case 'menu':
      return [shiftGrid(base, 'right'), base, shiftGrid(base, 'left')]; // slide
    case 'grid':
      return blinkFrames(base); // flash
    case 'edit':
      return [shiftGrid(base, 'right'), shiftGrid(base, 'down')]; // scribble
    case 'copy':
      return bounceFrames(base, 'right'); // duplicate shift
    case 'clipboard':
      return bounceFrames(base, 'up'); // lift
    case 'clipboard-check':
      return pulseFrames(base); // confirmed
    case 'link':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // tug
    case 'share':
      return shiftFrames(base, 'right', 2); // send out
    case 'filter':
      return bounceFrames(base, 'down'); // funnel
    case 'sort':
      return bounceFrames(base, 'up'); // reorder
    case 'calendar':
      return blinkFrames(base); // date change
    case 'camera':
      return blinkFrames(base); // shutter flash
    case 'image':
      return pulseFrames(base); // zoom
    case 'film':
      return shiftFrames(base, 'up', 2); // roll
    case 'mute':
      return blinkFrames(base); // silence flash
    case 'battery':
      return blinkFrames(base); // charge blink
    case 'map':
      return bounceFrames(base, 'up'); // float
    case 'info':
      return pulseFrames(base); // attention
    case 'help':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // wobble
    case 'folder':
      return bounceFrames(base, 'up'); // lift open
    case 'file':
      return bounceFrames(base, 'up'); // lift
    case 'code':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // type
    case 'terminal':
      return [shiftGrid(base, 'right'), base]; // cursor blink
    case 'database':
      return pulseFrames(base); // throb
    case 'server':
      return blinkFrames(base); // status blink
    case 'shield':
      return pulseFrames(base); // protect
    case 'print':
      return bounceFrames(base, 'down'); // paper out
    case 'save':
      return bounceFrames(base, 'down'); // save down
    case 'layers':
      return bounceFrames(base, 'up'); // stack
    case 'minimize':
      return bounceFrames(base, 'down'); // shrink down
    case 'crop':
      return pulseFrames(base); // frame
    case 'move':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // drag
    case 'chart':
      return bounceFrames(base, 'up'); // grow up
    case 'comment':
      return bounceFrames(base, 'up'); // pop up
    case 'chat':
      return bounceFrames(base, 'up'); // pop up
    case 'message':
      return bounceFrames(base, 'up'); // pop up
    case 'mention':
      return pulseFrames(base); // ping
    case 'thumbs-up':
      return bounceFrames(base, 'up'); // thumbs up motion
    case 'thumbs-down':
      return bounceFrames(base, 'down'); // thumbs down motion
    case 'rate':
      return pulseFrames(base); // glow
    case 'survey':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // fill in
    case 'feedback':
      return bounceFrames(base, 'up'); // bubble up

    // ── Status ──
    case 'pending':
      return blinkFrames(base); // waiting blink
    case 'rejected':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // shake no
    case 'on-hold':
      return blinkFrames(base); // paused blink
    case 'in-progress':
      return [shiftGrid(base, 'right'), shiftGrid(base, 'down'), shiftGrid(base, 'left')]; // spinner
    case 'cancelled':
      return blinkFrames(base); // fade
    case 'priority':
      return pulseFrames(base); // urgent pulse

    // ── Business ──
    case 'invoice':
      return bounceFrames(base, 'down'); // deliver
    case 'receipt':
      return bounceFrames(base, 'down'); // print out
    case 'contract':
      return bounceFrames(base, 'up'); // present
    case 'handshake':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // shake
    case 'briefcase':
      return bounceFrames(base, 'up'); // lift
    case 'presentation':
      return pulseFrames(base); // show
    case 'milestone':
      return pulseFrames(base); // achieve
    case 'dollar':
      return bounceFrames(base, 'up'); // cha-ching
    case 'percent':
      return blinkFrames(base); // flash
    case 'budget':
      return bounceFrames(base, 'up'); // grow
    case 'forecast':
      return shiftFrames(base, 'right', 2); // project forward

    // ── Manufacturing ──
    case 'factory':
      return bounceFrames(base, 'up'); // smoke rise
    case 'warehouse':
      return pulseFrames(base); // stock
    case 'forklift':
      return shiftFrames(base, 'right', 2); // drive
    case 'truck':
      return shiftFrames(base, 'right', 2); // drive
    case 'shipping':
      return shiftFrames(base, 'right', 2); // ship out
    case 'conveyor':
      return shiftFrames(base, 'right', 2); // belt move
    case 'crane':
      return bounceFrames(base, 'up'); // lift
    case 'pallet':
      return bounceFrames(base, 'up'); // stack
    case 'tools':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // work
    case 'wrench':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // turn
    case 'hammer':
      return bounceFrames(base, 'down'); // strike
    case 'hardhat':
      return bounceFrames(base, 'down'); // put on
    case 'gauge':
      return [shiftGrid(base, 'right'), shiftGrid(base, 'down'), shiftGrid(base, 'left')]; // needle spin
    case 'thermometer':
      return bounceFrames(base, 'up'); // temp rise
    case 'pipeline':
      return shiftFrames(base, 'right', 2); // flow
    case 'barcode':
      return blinkFrames(base); // scan flash
    case 'qr-code':
      return blinkFrames(base); // scan flash
    case 'scanner':
      return blinkFrames(base); // scan flash
    case 'inspection':
      return pulseFrames(base); // examine
    case 'quality':
      return pulseFrames(base); // check
    case 'defect':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // alert shake
    case 'maintenance':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // fix
    case 'repair':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // fix
    case 'schedule':
      return blinkFrames(base); // tick
    case 'shift':
      return shiftFrames(base, 'right', 2); // change
    case 'batch':
      return bounceFrames(base, 'up'); // stack
    case 'inventory':
      return bounceFrames(base, 'up'); // count

    // ── People ──
    case 'users':
      return bounceFrames(base, 'up'); // wave
    case 'team':
      return bounceFrames(base, 'up'); // huddle
    case 'department':
      return pulseFrames(base); // org
    case 'role':
      return bounceFrames(base, 'up'); // step up
    case 'assign':
      return shiftFrames(base, 'right', 2); // hand off
    case 'delegate':
      return shiftFrames(base, 'right', 2); // pass on
    case 'onboard':
      return shiftFrames(base, 'right', 2); // welcome in

    // ── Data ──
    case 'spreadsheet':
      return blinkFrames(base); // cell flash
    case 'pie-chart':
      return [shiftGrid(base, 'right'), shiftGrid(base, 'down'), shiftGrid(base, 'left')]; // spin
    case 'bar-chart':
      return bounceFrames(base, 'up'); // bars grow
    case 'line-chart':
      return bounceFrames(base, 'up'); // trend up
    case 'report':
      return bounceFrames(base, 'up'); // present
    case 'analytics':
      return pulseFrames(base); // insight
    case 'archive':
      return bounceFrames(base, 'down'); // store down
    case 'template':
      return blinkFrames(base); // stamp
    case 'draft':
      return blinkFrames(base); // incomplete flash
    case 'publish':
      return shiftFrames(base, 'up', 2); // release up
    case 'sidebar':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // slide
    case 'more-horizontal':
      return blinkFrames(base); // dot dot dot
    case 'more-vertical':
      return blinkFrames(base); // dot dot dot

    // ── Commerce ──
    case 'package':
      return bounceFrames(base, 'up'); // deliver
    case 'box':
      return bounceFrames(base, 'up'); // open
    case 'hash':
      return pulseFrames(base); // tag
    case 'at-sign':
      return pulseFrames(base); // mention
    case 'ticket':
      return bounceFrames(base, 'up'); // present
    case 'coupon':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // tear
    case 'paperclip':
      return [shiftGrid(base, 'left'), base, shiftGrid(base, 'right')]; // wobble

    // ── Media ──
    case 'undo':
      return shiftFrames(base, 'left', 2); // go back
    case 'redo':
      return shiftFrames(base, 'right', 2); // go forward
    case 'stop':
      return blinkFrames(base); // halt
    case 'skip':
      return shiftFrames(base, 'right', 2); // skip forward
    case 'headphones':
      return pulseFrames(base); // music pulse
    case 'attach':
      return bounceFrames(base, 'up'); // clip
    case 'table':
      return blinkFrames(base); // cell flash

    // ── Brands ──
    case 'github':
      return pulseFrames(base);
    case 'linkedin':
      return pulseFrames(base);
    case 'twitter':
      return bounceFrames(base, 'up');
    case 'facebook':
      return pulseFrames(base);
    case 'instagram':
      return pulseFrames(base);
    case 'youtube':
      return pulseFrames(base);
    case 'slack':
      return pulseFrames(base);
    case 'dribbble':
      return bounceFrames(base, 'up'); // bounce
    case 'figma':
      return pulseFrames(base);
    case 'spotify':
      return pulseFrames(base);
    case 'discord':
      return pulseFrames(base);
    case 'tiktok':
      return bounceFrames(base, 'up');
    case 'apple':
      return pulseFrames(base);
    case 'android':
      return bounceFrames(base, 'up');
    case 'windows':
      return pulseFrames(base);
    case 'chrome':
      return [shiftGrid(base, 'right'), shiftGrid(base, 'down'), shiftGrid(base, 'left')]; // spin
    case 'aws':
      return pulseFrames(base);
    case 'stripe':
      return pulseFrames(base);
    case 'leverage':
      return pulseFrames(base);

    default:
      return null;
  }
}

// Build the full animation data: { frames: [...grids], speed }
// Frame 0 is always the base icon
function getAnimation(name) {
  const extraFrames = getFrames(name);
  if (!extraFrames || extraFrames.length === 0) return null;

  const base = icons[name];
  // Full frame sequence: base → extra frames → back to base (loop)
  return {
    frames: [base, ...extraFrames],
    speed: 300, // ms per frame
  };
}

module.exports = { getAnimation };
