import { loadAssets, setVolume } from './assets.js';
import { setClicks, setLocalClicks, updateUser, switchMode, setCharacterImage } from './ui.js';
import { initSocket, emitClick } from './socket.js';
import { initInput, movementLoop, KEY } from './input.js';
import { createText, launchBanana } from './animations.js';
import * as Fox   from './characters/fox.js';
import * as Mario from './characters/mario.js';
import * as Kirby from './characters/kirby.js';

// ── State ──────────────────────────────────────────────────────────────────
let clicks = 0;        // global counter from server
let localClicks = 0;   // personal counter in localStorage
let currentClicks = 0; // burst counter, reset by cooldown (used for animations)
let faceLeft = true;   // character facing direction
let text = 'hiyaaa';   // speech bubble text, updated by switchMode()
let mode = localStorage.getItem('mode') ?? 'starfox';
let currentCharacter = Fox; // active character module reference
let fps = 0;
let switchCount = 0;   // checkbox click counter; ≥5 unlocks kirby

const CHARACTER_MAP = { starfox: Fox, mario: Mario, kirby: Kirby };

function getLocalCounter() {
    localClicks = parseInt(localStorage.getItem('clicks') ?? '0', 10);
}

// ── Debounce ────────────────────────────────────────────────────────────────
function debounce(fn, wait) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
}

// ── Cooldown ────────────────────────────────────────────────────────────────
// Check threshold BEFORE resetting currentClicks (order matters).
const cooldown = debounce(() => {
    if (mode === 'starfox' && currentClicks > 25) setCharacterImage('fox');
    if (mode === 'kirby'   && currentClicks > 25) setCharacterImage('kirby');
    currentClicks = 0;
    switchCount = 0;
}, 450);

// ── Mode switch ─────────────────────────────────────────────────────────────
function applyMode() {
    ({ text } = switchMode(mode));           // switchMode returns { text }
    currentCharacter = CHARACTER_MAP[mode];
    if (mode !== 'kirby') Kirby.resetScale(); // reset kirbyScale when leaving kirby mode
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
function toggleSidebar() {
    document.querySelector('.header .btn-round').classList.toggle('active');
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.header').classList.toggle('active');
}

// ── Game loop ────────────────────────────────────────────────────────────────
let _lastTime = 0;
function loop(timestamp) {
    const dt = _lastTime ? Math.min(timestamp - _lastTime, 50) : 16;
    _lastTime = timestamp;
    movementLoop(dt, faceLeft);
    if (fps === 4) { currentCharacter.shieldLoop(); fps = 0; }
    fps++;
    requestAnimationFrame(loop);
}

// ── Initialisation ──────────────────────────────────────────────────────────
// ES modules are deferred — DOM is ready and socket.io.js has already run.

loadAssets();
getLocalCounter();
setLocalClicks(localClicks);
applyMode();

initSocket({
    onInitialClicks: (n) => { clicks = n; setClicks(clicks); },
    onUpdate:        (n) => { clicks = n; setClicks(clicks); },
    onUsersConnected:(n) => updateUser(n),
});

initInput({
    onKeyDown:   (e) => { currentCharacter.onKeyDown(e, currentClicks); createText(text, faceLeft); },
    onKeyUp:     (e) => currentCharacter.onKeyUp(e, currentClicks),
    onArrowDown: (e) => {
        // Update facing direction — movementLoop applies the flip each frame.
        faceLeft = e.keyCode === KEY.LEFT || (e.target?.classList?.contains('js-left') ?? false);
    },
    onArrowUp: (_e) => { /* lookAt.left/right handled in input.js; no side-effect needed here */ },
    onEmitClick: () => {
        emitClick();
        currentClicks++;
        localClicks++;
        setClicks(clicks);        // display current server total (not local)
        setLocalClicks(localClicks);
        localStorage.setItem('clicks', String(localClicks));
        cooldown();
    },
});

// Mode toggle (StarFox ↔ Mario ↔ Kirby)
const checkbox = document.querySelector('.checkbox');
checkbox.checked = (mode === 'mario');
checkbox.addEventListener('click', () => {
    cooldown();
    switchCount++;
    if (switchCount >= 5) {
        mode = 'kirby';
    } else {
        mode = checkbox.checked ? 'mario' : 'starfox';
    }
    localStorage.setItem('mode', mode);
    applyMode();
});

// Banana
document.querySelector('.banana-btn').addEventListener('click', launchBanana);

// Share (optional API, guard with ?.)
document.querySelector('.share-btn')?.addEventListener('click', () => {
    window.navigator.share?.({
        title: document.title,
        text: 'HIYAAA!',
        url: 'https://starfox.qwetle.fr/',
    });
});

// Sidebar toggle
document.querySelector('.header .btn-round').addEventListener('click', toggleSidebar);

// Hide keyboard controls on touch-only devices (phones/tablets).
// (hover: none) is accurate: touchscreen laptops still have hover via mouse,
// so they keep the controls. navigator.maxTouchPoints > 0 was too aggressive
// — Windows Chrome reports 10 even on non-touch desktops.
if (!window.matchMedia('(hover: hover)').matches) {
    document.querySelector('.arrow-key-container').style.display = 'none';
    document.querySelector('.banana-btn').style.display = 'none';
}

// Volume widget
const savedVolume = parseFloat(localStorage.getItem('volume') ?? '1');
const volumeSlider = document.querySelector('.volume-slider');

function applyVolume(v) {
    volumeSlider.style.setProperty('--vol', Math.round(v * 100));
    setVolume(v);
}

volumeSlider.value = String(savedVolume);
applyVolume(savedVolume);

volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    applyVolume(v);
    localStorage.setItem('volume', String(v));
});

requestAnimationFrame(loop);
