import { getImage } from './assets.js';

/**
 * Renders a number into el using <i> elements as thousands separators.
 * All content is created via DOM methods — no user-controlled strings are
 * inserted as HTML.
 */
function renderFormattedNumber(el, val) {
    const digits = String(Math.round(val));
    el.textContent = '';
    for (let i = 0; i < digits.length; i++) {
        const offset = digits.length - i;
        if (i > 0 && offset % 3 === 0) {
            const sep = document.createElement('i');
            sep.textContent = '.';
            el.appendChild(sep);
        }
        el.appendChild(document.createTextNode(digits[i]));
    }
}

export function setClicks(val) {
    renderFormattedNumber(document.querySelector('.counter__click .number'), val);
}

export function setLocalClicks(val) {
    renderFormattedNumber(document.querySelector('.selfcounter__container'), val);
}

export function updateUser(val) {
    document.querySelector('.counter__user').textContent =
        val + (val > 1 ? ' users currently connected' : ' user currently connected');
}

export function setCharacterImage(imageId) {
    // Uses CSS background-image to match <div class="img"> structure in index.html
    document.querySelector('.character .img').style.backgroundImage =
        `url("${getImage(imageId)}")`;
}

/**
 * Updates the DOM for the given mode.
 * Returns { text } for main.js to update its local `text` variable.
 * Called from: main.js (applyMode and checkbox click handler).
 */
export function switchMode(mode) {
    const faKirby    = document.querySelector('.fa-kirby');
    const faStarfox  = document.querySelector('.fa-starfox');
    const faMario    = document.querySelector('.fa-mario');
    const label      = document.querySelector('.label');
    const ball       = document.querySelector('.label .ball');
    const rowStarfox = document.querySelector('.arrow-key-container .row.starfox');
    const rowKirby   = document.querySelector('.arrow-key-container .row.kirby');
    const selfCounter = document.querySelector('.selfcounter__container');
    const counterText = document.querySelector('.counter__click .text');
    const charImg     = document.querySelector('.character .img');

    charImg.style.transform = 'scale(1)';

    if (mode === 'kirby') {
        faKirby.style.display    = 'block';
        faStarfox.style.display  = 'none';
        faMario.style.display    = 'none';
        label.style.width        = '35px';
        ball.style.display       = 'none';
        rowStarfox.style.display = 'none';
        rowKirby.style.display   = 'flex';
        selfCounter.style.color  = '#FD9FD6';
        setCharacterImage('kirby');
        counterText.textContent  = 'POYO!';
        return { text: 'poyo' };
    }

    // Shared logic for starfox and mario
    faKirby.style.display    = 'none';
    faStarfox.style.display  = '';
    faMario.style.display    = '';
    label.style.width        = '70px';
    ball.style.display       = '';
    rowStarfox.style.display = '';
    rowKirby.style.display   = 'none';

    if (mode === 'starfox') {
        selfCounter.style.color = '#EB9B24';
        setCharacterImage('fox');
        counterText.textContent = 'HIYAAA!';
        return { text: 'hiyaa' };
    }

    // mario
    selfCounter.style.color = '#D91430';
    setCharacterImage('mario');
    counterText.textContent = 'YAHOO!';
    return { text: 'yahoo' };
}
