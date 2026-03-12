import { playSound } from '../assets.js';
import { setCharacterImage } from '../ui.js';
import { lookAt, KEY } from '../input.js';

let shieldState = false;

function rand(min, max) { return Math.random() * (max - min + 1) + min; }
function isUp(e)   { return e.keyCode === KEY.UP   || (e.target?.classList?.contains('js-up')   ?? false); }
function isDown(e) { return e.keyCode === KEY.DOWN  || (e.target?.classList?.contains('js-down') ?? false); }

export function onKeyDown(e, currentClicks) {
    playSound('hiyaaa', true);
    // Declared exception: fox.js is the only module outside input.js
    // permitted to mutate lookAt.down (shield is fox-specific logic).
    lookAt.down = false;

    if (currentClicks > 25) {
        setCharacterImage('foxPistol1');
        document.querySelector('.character .img').style.transform =
            `translate(0, ${rand(5, 20)}px)`;
    } else if (isUp(e)) {
        setCharacterImage('foxKick');
    } else if (isDown(e)) {
        lookAt.down = true;
    } else {
        setCharacterImage('foxScream');
    }
}

export function onKeyUp(e, currentClicks) {
    if (isDown(e)) lookAt.down = false;

    if (currentClicks > 25) {
        setCharacterImage('foxPistol2');
        document.querySelector('.character .img').style.transform = 'translate(0, 0px)';
    } else {
        setCharacterImage('fox');
    }
}

export function shieldLoop() {
    if (!lookAt.down) return;
    shieldState = !shieldState;
    setCharacterImage(shieldState ? 'foxShield1' : 'foxShield2');
}
