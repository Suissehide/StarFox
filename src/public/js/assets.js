// All asset paths are relative to public/js/ → ../assets/
const assetsPath = '../assets/';

const manifest = [
    { id: 'hiyaaa', type: 'sound', src: 'sounds/hiyaaa.mp3' },
    { id: 'yahoo',  type: 'sound', src: 'sounds/yahoo.mp3' },
    { id: 'poyo',   type: 'sound', src: 'sounds/poyo.mp3' },
    { id: 'key',    type: 'sound', src: 'sounds/asmr-keyboard.mp3' },

    { id: 'fox',        type: 'image', src: 'images/Fox.png' },
    { id: 'foxPistol1', type: 'image', src: 'images/FoxPistol1.png' },
    { id: 'foxPistol2', type: 'image', src: 'images/FoxPistol2.png' },
    { id: 'foxScream',  type: 'image', src: 'images/FoxScream.png' },
    { id: 'foxShield1', type: 'image', src: 'images/FoxShield1.png' },
    { id: 'foxShield2', type: 'image', src: 'images/FoxShield2.png' },
    { id: 'foxRun',     type: 'image', src: 'images/FoxRun.png' },
    { id: 'foxKick',    type: 'image', src: 'images/FoxKick.png' },

    { id: 'kirby',       type: 'image', src: 'images/Kirby.png' },
    { id: 'kirbyInhale', type: 'image', src: 'images/KirbyInhale.png' },
    { id: 'kirbyPoyo',   type: 'image', src: 'images/KirbyPoyo.png' },
    { id: 'kirbo',       type: 'image', src: 'images/Kirbo.gif' },

    { id: 'mario',      type: 'image', src: 'images/Mario.png' },
    { id: 'marioJump',  type: 'image', src: 'images/MarioJump.png' },
    { id: 'marioDown',  type: 'image', src: 'images/MarioDown.png' },
    { id: 'marioYahoo', type: 'image', src: 'images/MarioYahoo.png' },
];

let soundsLoaded = false;
const sounds = {};

export function loadAssets() {
    manifest.forEach((item) => {
        if (item.type === 'sound') {
            const audio = new Audio(assetsPath + item.src);
            audio.preload = 'auto';
            audio.volume = 1;
            audio.load();
            sounds[item.id] = audio;
        }
    });
    soundsLoaded = true;
}

export function getImage(id) {
    return assetsPath + manifest.find((item) => item.id === id).src;
}

/**
 * Plays a sound.
 * clone=true: clones the audio node so the sound can overlap itself (e.g. rapid poyo).
 * clone=false: replays the single audio node (e.g. keyboard walk sound).
 * No-op until loadAssets() has been called.
 */
export function playSound(id, clone) {
    if (!soundsLoaded) return;
    if (clone) {
        sounds[id].cloneNode(true).play();
    } else {
        sounds[id].play();
    }
}

export function stopSound(id) {
    if (!soundsLoaded) return;
    if (!sounds[id].paused) sounds[id].pause();
    sounds[id].currentTime = 0;
}

export function isPlaying(id) {
    if (!soundsLoaded) return false;
    return !(sounds[id].paused && sounds[id].currentTime === 0);
}

/**
 * Sets the global volume for all sounds (0.0–1.0).
 * Applies immediately to all loaded audio nodes.
 */
export function setVolume(value) {
    const v = Math.max(0, Math.min(1, value));
    Object.values(sounds).forEach((audio) => { audio.volume = v; });
}

export function getVolume() {
    // Returns the current volume of the first sound node, or 1 as default.
    const first = Object.values(sounds)[0];
    return first ? first.volume : 1;
}
