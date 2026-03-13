import { isPlaying, playSound, stopSound } from './assets.js';

export const KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, A: 65, B: 66 };

/**
 * lookAt tracks held directional state.
 * Writers: input.js (.left, .right) and fox.js (.down — declared exception).
 * Readers: all other modules (read-only).
 */
export const lookAt = { left: false, right: false, down: false };

// Offset from CSS-centered position (0 = center). Using transform: translateX
// instead of marginLeft avoids layout reflow on every frame.
let pos = 0;
const rightBound =  (window.innerWidth / 2) - 175; // equiv. to abs. bound: innerWidth - 375
const leftBound  = -((window.innerWidth / 2) - 175);
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

let _container = null;

const SPEED = 2500; // px/sec (equivalent to the original 25px per 10ms)

/**
 * Called each animation frame from the game loop.
 * dt: time elapsed since last frame in milliseconds.
 * faceLeft: current facing direction (from main.js).
 * Uses transform: translateX for GPU-composited movement (no layout reflow).
 */
export function movementLoop(dt, faceLeft) {
    if (!_container) _container = document.querySelector('.character .img__container');
    const step = SPEED * dt / 1000;

    // Single transform: combines position offset + horizontal flip.
    const scaleX = faceLeft ? 1 : -1;
    _container.style.transform = `translateX(${pos}px) scale(${scaleX}, 1)`;

    if (lookAt.left || lookAt.right) {
        if (!isPlaying('key')) playSound('key', false);
    } else {
        if (isPlaying('key')) stopSound('key');
    }

    if (lookAt.right)     pos = Math.min(pos + step, rightBound);
    else if (lookAt.left) pos = Math.max(pos - step, leftBound);
}
