import { isPlaying, playSound, stopSound } from './assets.js';

export const KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, A: 65, B: 66 };

/**
 * lookAt tracks held directional state.
 * Writers: input.js (.left, .right) and fox.js (.down — declared exception).
 * Readers: all other modules (read-only).
 */
export const lookAt = { left: false, right: false, down: false };

let pos = (window.innerWidth / 2) - 200; // horizontal character position, pixels
let lastKey = 0;
let _cb = {};

function cls(e, name) {
    return e.target?.classList?.contains(name) ?? false;
}

function isLeft(e)  { return e.keyCode === KEY.LEFT  || cls(e, 'js-left'); }
function isRight(e) { return e.keyCode === KEY.RIGHT || cls(e, 'js-right'); }

function syncKeyUI(e, pressed) {
    const pairs = [
        ['js-left', KEY.LEFT], ['js-right', KEY.RIGHT],
        ['js-up',   KEY.UP],   ['js-down',  KEY.DOWN],
        ['js-a',    KEY.A],    ['js-b',     KEY.B],
    ];
    for (const [className, code] of pairs) {
        if (cls(e, className) || e.keyCode === code) {
            document.querySelector(`.arrow-key[data-key="${code}"]`)
                ?.classList.toggle('pressed', pressed);
        }
    }
}

function handleDown(e) {
    syncKeyUI(e, true);
    // Ignore key repeat (held key fires repeated keydown events)
    if (e.type !== 'pointerdown' && e.keyCode === lastKey) return;
    lastKey = e.keyCode;

    // onEmitClick fires for ALL key types (matching original behaviour where
    // emitClicks() was called unconditionally before the arrow/character branch)
    _cb.onEmitClick?.();

    if (isLeft(e) || isRight(e)) {
        if (isLeft(e)  && !lookAt.left)  lookAt.left = true;
        if (isRight(e) && !lookAt.right) lookAt.right = true;
        _cb.onArrowDown?.(e);
    } else {
        _cb.onKeyDown?.(e);
    }
}

function handleUp(e) {
    syncKeyUI(e, false);
    if (e.type !== 'pointerdown' && e.keyCode === lastKey) lastKey = 0;

    if (isLeft(e) || isRight(e)) {
        if (isLeft(e))  lookAt.left = false;
        if (isRight(e)) lookAt.right = false;
        _cb.onArrowUp?.(e);
    } else {
        _cb.onKeyUp?.(e);
    }
}

export function initInput(callbacks) {
    _cb = callbacks;
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    document.querySelector('.container').addEventListener('pointerdown', handleDown);
    document.querySelector('.container').addEventListener('pointerup', handleUp);
}

/**
 * Called every 10ms from the game loop.
 * Moves the character horizontally and controls the walk sound.
 */
export function movementLoop() {
    const container = document.querySelector('.character .img__container');
    if (lookAt.left || lookAt.right) {
        container.style.marginLeft = pos + 'px';
        if (!isPlaying('key')) playSound('key', false);
    } else {
        if (isPlaying('key')) stopSound('key');
    }

    if (lookAt.right) {
        pos = Math.min(pos + 25, window.innerWidth - 375);
    } else if (lookAt.left) {
        pos = Math.max(pos - 25, -25);
    }
}
