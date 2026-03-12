import { playSound } from '../assets.js';
import { setCharacterImage } from '../ui.js';
import { KEY } from '../input.js';

function rand(min, max) { return Math.random() * (max - min + 1) + min; }
function isUp(e)   { return e.keyCode === KEY.UP   || (e.target?.classList?.contains('js-up')   ?? false); }
function isDown(e) { return e.keyCode === KEY.DOWN  || (e.target?.classList?.contains('js-down') ?? false); }

export function onKeyDown(e, _currentClicks) {
    playSound('yahoo', true);
    const img = document.querySelector('.character .img');
    if (isUp(e)) {
        setCharacterImage('marioJump');
        img.style.transform = `translate(0, ${rand(-30, -45)}px)`;
    } else if (isDown(e)) {
        setCharacterImage('marioDown');
        img.style.transform = `translate(0, ${rand(30, 45)}px)`;
    } else {
        setCharacterImage('marioYahoo');
        img.style.transform = `translate(0, ${rand(-15, -30)}px)`;
    }
}

export function onKeyUp(_e, _currentClicks) {
    setCharacterImage('mario');
    document.querySelector('.character .img').style.transform = 'translate(0, 0px)';
}

export function shieldLoop() {} // no-op — uniform interface
