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
function loop() {
    movementLoop();
    if (fps === 7) { currentCharacter.shieldLoop(); fps = 0; }
    fps++;
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
        // Update facing direction and flip character sprite
        faceLeft = e.keyCode === KEY.LEFT || (e.target?.classList?.contains('js-left') ?? false);
        document.querySelector('.character .img__container').style.transform =
            faceLeft ? 'scale(1)' : 'scale(-1, 1)';
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

// Mobile: hide keyboard controls on touch devices.
// navigator.maxTouchPoints > 0 replaces the original 1400-char UA regex.
// Trade-off: some touchscreen laptops also hide controls. Accepted — see spec.
if (navigator.maxTouchPoints > 0) {
    document.querySelector('.arrow-key-container').style.display = 'none';
    document.querySelector('.banana-btn').style.display = 'none';
}

// Volume widget
const savedVolume = parseFloat(localStorage.getItem('volume') ?? '1');
const volumeSlider = document.querySelector('.volume-slider');
const volumeBtn    = document.querySelector('.volume-btn');

volumeSlider.value = String(savedVolume);
setVolume(savedVolume);

function updateVolumeIcon(v) {
    volumeBtn.textContent = v === 0 ? '🔇' : v < 0.4 ? '🔉' : '🔊';
}
updateVolumeIcon(savedVolume);

volumeSlider.addEventListener('input', () => {
    const v = parseFloat(volumeSlider.value);
    setVolume(v);
    localStorage.setItem('volume', String(v));
    updateVolumeIcon(v);
});

volumeBtn.addEventListener('click', () => {
    const current = parseFloat(volumeSlider.value);
    const next = current > 0 ? 0 : parseFloat(localStorage.getItem('volume-before-mute') ?? '1');
    if (current > 0) localStorage.setItem('volume-before-mute', String(current));
    volumeSlider.value = String(next);
    setVolume(next);
    localStorage.setItem('volume', String(next));
    updateVolumeIcon(next);
});

setInterval(loop, 10);
