function rand(min, max) { return Math.random() * (max - min + 1) + min; }

/**
 * Creates a floating speech bubble that animates outward and fades.
 * faceLeft: true if the character faces left (affects bubble rotation).
 */
export function createText(text, faceLeft) {
    const radius = rand(200, 250);
    const angle  = rand(340, 200) / 180 * Math.PI;
    const startX = Math.cos(angle) * radius + 200;
    const startY = Math.sin(angle) * radius + 200;
    const endX   = (Math.cos(angle) * (radius + 125) + 200) - startX;
    const endY   = (Math.sin(angle) * (radius + 125) + 200) - startY;

    const el = document.createElement('p');
    el.className = 'dialog';
    el.textContent = text; // safe — `text` is always a hardcoded string from main.js
    el.style.left = `${startX - 31}px`;
    el.style.top  = `${startY - 31}px`;
    el.style.transform =
        `rotate(${(angle * 180 / Math.PI) - (faceLeft ? 270 : 90)}deg) ` +
        `scale(${faceLeft ? '1,1' : '1,-1'})`;
    el.style.transition = 'margin-left 0.1s linear';
    el.style.position = 'absolute';
    document.querySelector('.img').appendChild(el);

    const duration = 500;
    const start = performance.now();
    function animate(now) {
        const t = Math.min((now - start) / duration, 1);
        el.style.opacity = String(1 - t);
        el.style.left = `${startX - 31 + endX * t}px`;
        el.style.top  = `${startY - 31 + endY * t}px`;
        if (t < 1) { requestAnimationFrame(animate); } else { el.remove(); }
    }
    requestAnimationFrame(animate);
}

let bananaDone = true;

/**
 * Launches the banana + DonkeyKong animation.
 * Reads window.innerWidth internally. Guarded by bananaDone flag.
 * Listener registered in main.js (step 7 of init).
 */
export function launchBanana() {
    if (!bananaDone) return;
    bananaDone = false;

    const W = window.innerWidth;
    const g = 0.2, a = 45; // angle degrees
    const speed = Math.sqrt((g * (W + 100)) / Math.sin(2 * a));
    const endX  = (W + 100) * 0.8;
    const endY  = ((-0.5 * g * endX ** 2) / (speed ** 2 * Math.cos(a) ** 2)) + endX * Math.tan(a);

    let x = 0, y = 0, t = 0, rot = 0, peak = false;
    const banana = document.querySelector('.banana');

    const id = setInterval(() => {
        banana.style.left      = `${x}px`;
        banana.style.bottom    = `${y}px`;
        banana.style.transform = `rotate(${rot}deg)`;

        if (y >= endY) peak = true;
        if (peak && y <= endY) {
            clearInterval(id);
            banana.style.right     = '-100px';
            banana.style.bottom    = '-100px';
            banana.style.transform = 'rotate(0deg)';
            releaseDonkeyKong(endX - 400, endY - 200);
        } else {
            x = (speed * Math.cos(a) * t) - 100;
            y = ((-0.5 * g * t * t) + (speed * Math.sin(a) * t)) - 100;
        }
        t   += 1;
        rot += 5;
    }, 10);
}

function releaseDonkeyKong(posX, posY) {
    let y = -400, rot = 0, peaked = false;
    const dk = document.querySelector('.donkeyKong');
    dk.style.left = `${posX}px`;

    const id = setInterval(() => {
        dk.style.bottom    = `${y}px`;
        dk.style.transform = `rotate(${rot}deg)`;

        if (y < -400) {
            clearInterval(id);
            dk.style.bottom = '-400px';
            bananaDone = true;
        } else if (!peaked && y < posY) {
            y += 5;
        } else {
            y -= 5;
            peaked = true;
        }
        rot += 4;
    }, 10);
}
