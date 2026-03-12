import { playSound } from '../assets.js';
import { setCharacterImage } from '../ui.js';
import { KEY } from '../input.js';

let kirbyScale = 1; // private — reset via resetScale() called from main.js

function isA(e) { return e.keyCode === KEY.A || (e.target?.classList?.contains('js-a') ?? false); }
function isB(e) { return e.keyCode === KEY.B || (e.target?.classList?.contains('js-b') ?? false); }

export function onKeyDown(e, currentClicks) {
    playSound('poyo', true);
    // if/else if chain: currentClicks>25 gates ALL other branches
    if (currentClicks > 25) {
        setCharacterImage('kirbo');
    } else if (isA(e)) {
        setCharacterImage('kirbyInhale');
        kirbyScale += 0.1;
        document.querySelector('.character .img').style.transform = `scale(${kirbyScale})`;
    } else if (isB(e)) {
        setCharacterImage('kirbyInhale');
        kirbyScale -= 0.1;
        document.querySelector('.character .img').style.transform = `scale(${kirbyScale})`;
    } else {
        setCharacterImage('kirbyPoyo');
    }
}

export function onKeyUp(_e, currentClicks) {
    if (currentClicks > 25) {
        setCharacterImage('kirbo');
    } else {
        setCharacterImage('kirby');
    }
}

export function shieldLoop() {} // no-op — uniform interface

export function resetScale() {
    kirbyScale = 1;
    document.querySelector('.character .img').style.transform = 'scale(1)';
}
