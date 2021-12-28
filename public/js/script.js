/*******************
 * SCRIPT
 *******************/

const dispatcher = $(window)
const KEYCODE_LEFT = 37 //useful keycode
const KEYCODE_UP = 38 //useful keycode
const KEYCODE_RIGHT = 39 //useful keycode
const KEYCODE_DOWN = 40 //useful keycode
const KEYCODE_A = 65 //useful keycode
const KEYCODE_B = 66 //useful keycode

var init = false;
var clicks = 0;
var localClicks = 0;
var currentClicks = 0;
var faceLeft = true;
var lookAt = [false, false, false, false]; //left right up down
var pos = ($(window).width() / 2) - 200;
let text = 'hiyaaa';

/*******************
* WEBSOCKET
*/
const socket = io.connect('http://localhost:8080');

socket.on('users connected', function (users) {
    updateUser(users);
});

socket.on('initial clicks', (click) => {
    clicks = click
    setClicks(click);
});

socket.on('update', function (click) {
    clicks = click
    setClicks(click);
});

emitClicks = () => {
    socket.emit('click');
}

/*******************
 * Handle click
 */
let assetsPath = 'assets/';
let manifest = [
    { id: "hiyaaa", type: 'sound', src: "sounds/hiyaaa.mp3" },
    { id: "yahoo", type: 'sound', src: "sounds/yahoo.mp3" },
    { id: "poyo", type: 'sound', src: "sounds/poyo.mp3" },
    { id: "key", type: 'sound', src: "sounds/asmr-keyboard.mp3" },

    { id: 'fox', type: 'image', src: 'images/Fox.png' },
    { id: 'foxPistol1', type: 'image', src: 'images/FoxPistol1.png' },
    { id: 'foxPistol2', type: 'image', src: 'images/FoxPistol2.png' },
    { id: 'foxScream', type: 'image', src: 'images/FoxScream.png' },
    { id: 'foxShield1', type: 'image', src: 'images/FoxShield1.png' },
    { id: 'foxShield2', type: 'image', src: 'images/FoxShield2.png' },
    { id: 'foxRun', type: 'image', src: 'images/FoxRun.png' },
    { id: 'foxKick', type: 'image', src: 'images/FoxKick.png' },

    { id: 'kirby', type: 'image', src: 'images/Kirby.png' },
    { id: 'kirbyInhale', type: 'image', src: 'images/KirbyInhale.png' },
    { id: 'kirbyPoyo', type: 'image', src: 'images/KirbyPoyo.png' },
    { id: 'kirbo', type: 'image', src: 'images/Kirbo.gif' },

    { id: 'mario', type: 'image', src: 'images/Mario.png' },
    { id: 'marioJump', type: 'image', src: 'images/MarioJump.png' },
    { id: 'marioDown', type: 'image', src: 'images/MarioDown.png' },
    { id: 'marioYahoo', type: 'image', src: 'images/MarioYahoo.png' },
]
let sounds = [];
let lastKey;

loadSound = () => {
    manifest.forEach(function (item, index) {
        if (item.type === 'sound') {
            sounds[item.id] = new Audio(assetsPath + item.src);
            sounds[item.id].volume = 1;
            sounds[item.id].muted = true;
            sounds[item.id].load();
        }
    });
}

getImage = (id) => {
    return assetsPath + manifest.find(item => item.id === id).src;
}

getLocalCounter = () => {
    localClicks = localStorage.getItem('clicks') ? localStorage.getItem('clicks') : 0;
}

init = () => {
    loadSound();
    getLocalCounter();
    setLocalClicks(localClicks);
}

playSound = (id, clone) => {
    sounds[id].muted = false;
    if (init)
        clone ? sounds[id].cloneNode(true).play() : sounds[id].play();
}

stopSound = (id) => {
    if (!sounds[id].paused) sounds[id].pause();
    sounds[id].currentTime = 0;
}

isPlaying = (id) => {
    if (sounds[id].paused && !sounds[id].currentTime > 0)
        return false;
    return true;
}

dispatcher.bind('keyup', handleKeyUp);
dispatcher.bind('keydown', handleKeyDown);

$('.container').on('pointerup', function (e) { handleKeyUp(e) })
$('.container').on('pointerdown', function (e) { handleKeyDown(e) })



function randomFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function handleKeyUp(e) {
    const key = document.querySelector(`.arrow-key[data-key="${e.keyCode}"]`);
    if (key) key.classList.remove('pressed');
    getClickedKey(e, false);

    if (e.type != "pointerdown" && e.keyCode == lastKey) lastKey = 0;

    if (e.keyCode == KEYCODE_LEFT || e.keyCode == KEYCODE_RIGHT ||
        $(e.target).hasClass('js-left') || $(e.target).hasClass('js-right')) {
        arrowUp(e);
    } else {
        switch (mode) {
            case 'kirby':
                updateKirbyUp(e);
                break;
            case 'mario':
                updateMarioUp(e);
                break;
            case 'starfox':
                updateFoxUp(e);
                break;
            default:
                break;
        }
    }
}

function handleKeyDown(e) {
    if (!init) init = true
    const key = document.querySelector(`.arrow-key[data-key="${e.keyCode}"]`);
    if (key) key.classList.add('pressed');
    getClickedKey(e, true);

    if (e.type != "pointerdown" && e.keyCode == lastKey) return;
    lastKey = e.keyCode;
    emitClicks();
    currentClicks++;
    localClicks++;
    setClicks(clicks);
    setLocalClicks(localClicks);
    localStorage.setItem('clicks', localClicks);
    cooldown();

    if (e.keyCode == KEYCODE_LEFT || e.keyCode == KEYCODE_RIGHT ||
        $(e.target).hasClass('js-left') || $(e.target).hasClass('js-right')) {
        arrowDown(e);
    } else {
        switch (mode) {
            case 'kirby':
                updateKirbyDown(e);
                break;
            case 'mario':
                updateMarioDown(e);
                break;
            case 'starfox':
                updateFoxDown(e);
                break;
            default:
                break;
        }
        createText();
    }
}

getClickedKey = (e, state) => {
    if ($(e.target).hasClass('js-left'))
        state ? $('.arrow-key.js-left').addClass('pressed') : $('.arrow-key.js-left').removeClass('pressed');
    else if ($(e.target).hasClass('js-right'))
        state ? $('.arrow-key.js-right').addClass('pressed') : $('.arrow-key.js-right').removeClass('pressed');
    else if ($(e.target).hasClass('js-down'))
        state ? $('.arrow-key.js-down').addClass('pressed') : $('.arrow-key.js-down').removeClass('pressed');
    else if ($(e.target).hasClass('js-up'))
        state ? $('.arrow-key.js-up').addClass('pressed') : $('.arrow-key.js-up').removeClass('pressed');
    else if ($(e.target).hasClass('js-a'))
        state ? $('.arrow-key.js-a').addClass('pressed') : $('.arrow-key.js-a').removeClass('pressed');
    else if ($(e.target).hasClass('js-b'))
        state ? $('.arrow-key.js-b').addClass('pressed') : $('.arrow-key.js-b').removeClass('pressed');
}
/* Kirby
========================================================================== */
let kirbyScale = 1;

updateKirbyUp = (e) => {
    if (currentClicks > 25) {
        setImage('.character .img', 'kirbo');
    } else {
        setImage('.character .img', 'kirby');
    }
}

updateKirbyDown = (e) => {
    playSound('poyo', true);
    if (currentClicks > 25) {
        setImage('.character .img', 'kirbo');
    } else if (e.keyCode == KEYCODE_A || $(e.target).hasClass('js-a')) {
        setImage('.character .img', 'kirbyInhale');
        kirbyScale += 0.1;
        $('.character .img').css({ transform: 'scale(' + kirbyScale + ')' })
    } else if (e.keyCode == KEYCODE_B || $(e.target).hasClass('js-b')) {
        setImage('.character .img', 'kirbyInhale');
        kirbyScale -= 0.1;
        $('.character .img').css({ transform: 'scale(' + kirbyScale + ')' })
    } else {
        setImage('.character .img', 'kirbyPoyo');
    }
};


/* Mario
========================================================================== */
updateMarioUp = (e) => {
    setImage('.character .img', 'mario');
    $('.character .img').css({
        'transform': 'translate(0, 0px)',
    });
}

updateMarioDown = (e) => {
    playSound('yahoo', true);
    if (e.keyCode == KEYCODE_UP || $(e.target).hasClass('js-up')) {
        setImage('.character .img', 'marioJump');
        $('.character .img').css({
            'transform': 'translate(0, ' + randomFromInterval(-30, -45) + 'px)',
        });
    } else if (e.keyCode == KEYCODE_DOWN || $(e.target).hasClass('js-down')) {
        setImage('.character .img', 'marioDown');
        $('.character .img').css({
            'transform': 'translate(0, ' + randomFromInterval(30, 45) + 'px)',
        });
    } else {
        setImage('.character .img', 'marioYahoo');
        $('.character .img').css({
            'transform': 'translate(0, ' + randomFromInterval(-15, -30) + 'px)'
        });
    }
};


/* Starfox
========================================================================== */
updateFoxUp = (e) => {
    if (e.keyCode == KEYCODE_DOWN || $(e.target).hasClass('js-down')) lookAt[3] = false;
    if (currentClicks > 25) {
        setImage('.character .img', 'foxPistol2');
        $('.character .img').css({
            'transform': 'translate(0, 0px)',
        });
    } else {
        setImage('.character .img', 'fox');
    }
}

updateFoxDown = (e) => {
    playSound('hiyaaa', true);
    lookAt[3] = false;
    if (currentClicks > 25) {
        setImage('.character .img', 'foxPistol1');
        $('.character .img').css({
            'transform': 'translate(0, ' + randomFromInterval(5, 20) + 'px)',
        });
    } else if (e.keyCode == KEYCODE_UP || $(e.target).hasClass('js-up')) {
        setImage('.character .img', 'foxKick');
    } else if (e.keyCode == KEYCODE_DOWN || $(e.target).hasClass('js-down')) {
        lookAt[3] = true;
    } else {
        setImage('.character .img', 'foxScream');
    }
};

/* Tools
========================================================================== */
setImage = (element, imageId) => {
    $(element).css({ 'background-image': 'url("' + getImage(imageId) + '")' });
}

formatNumber = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '<i>.</i>');
}

setClicks = (val) => {
    $('.counter__click .number').html(formatNumber(val));
}

setLocalClicks = (val) => {
    $('.selfcounter__container').html(formatNumber(val));
}

updateUser = (val) => {
    $('.counter__user').text(val + (val > 1 ? " users currently connected" : " user currently connected"));
}

/* Text
========================================================================== */
createText = () => {
    let minAngleDegrees = 200,
        maxAngleDegrees = 340,
        radius = randomFromInterval(200, 250);
    let angle = randomFromInterval(maxAngleDegrees, minAngleDegrees) / 180 * Math.PI;
    let startX = Math.cos(angle) * radius + 200;
    let startY = Math.sin(angle) * radius + 200;
    let endX = (Math.cos(angle) * (radius + 125) + 200) - startX;
    let endY = (Math.sin(angle) * (radius + 125) + 200) - startY;
    let el = $("<p class='dialog'></p>").text(text);
    el.css({
        left: (startX - 31) + 'px',
        top: (startY - 31) + 'px',
        transform: 'rotate(' + ((angle * (180 / Math.PI)) - (faceLeft ? 270 : 90)) + 'deg) scale(' + (faceLeft ? '1, 1' : '1, -1') + ')',
        transition: 'margin-left 0.1s linear'
    })
    el.animate({
        overflow: "visible",
        opacity: 0,
        left: "+=" + endX,
        top: "+=" + endY
    }, 500, function () {
        $(this).remove();
    });
    $('.img').append(el);
}

/* Sonic
========================================================================== */
launchSonicAnimation = () => {
    let id = null;
    let posSonic = $(window).width();
    clearInterval(id);
    id = setInterval(frame, 10);
    function frame() {
        if (posSonic <= -200) {
            clearInterval(id);
            $('.sonic').css({ left: '100%' });
        } else {
            posSonic -= 30;
            $('.sonic').css({ left: posSonic + 'px' });
        }
    }
}
// launchSonicAnimation();

/* DonkeyKong
========================================================================== */
let bananeDone = true;
$('.banana-btn').on('click', function () {
    if (!bananeDone) return;
    bananeDone = false;
    const g = 0.2;
    let id = null,
        peak = false;
    time = 0;
    angle = 45,
        x = 0,
        y = 0,
        rotation = 0;
    const speed = Math.sqrt((g * ($(window).width() + 100)) / (Math.sin(2 * angle)));
    const endX = ($(window).width() + 100) * 0.8;
    const endY = ((-0.5 * g * Math.pow(endX, 2)) / (Math.pow(speed, 2) * Math.pow(Math.cos(angle), 2))) + (endX * Math.tan(angle));
    clearInterval(id);
    id = setInterval(frameBanana, 10);
    function frameBanana() {
        $('.banana').css({
            left: x + 'px',
            bottom: y + 'px',
            transform: 'rotate(' + rotation + 'deg)'
        });
        if (y >= endY) {
            peak = true;
        }
        if (peak && y <= endY) {
            clearInterval(id);
            $('.banana').css({
                right: '-100px',
                bottom: '-100px',
                transform: 'rotate(0deg)'
            });
        } else {
            x = (speed * Math.cos(angle) * time) - 100;
            y = ((-0.5 * g * time * time) + (speed * Math.sin(angle) * time)) - 100;
        }
        time += 1;
        rotation += 5;
    }
    releaseDonkeyKong(endX - 400, endY - 200);
});

releaseDonkeyKong = (posX, posY) => {
    let id = null,
        banana = false,
        rotation = 0;
    let donkeyKongY = -400;
    $('.donkeyKong').css({ left: posX });
    clearInterval(id);
    id = setInterval(frameDonkeyKong, 10);
    function frameDonkeyKong() {
        $('.donkeyKong').css({
            bottom: donkeyKongY + 'px',
            transform: 'rotate(' + rotation + 'deg)'
        });
        if (donkeyKongY < -400) {
            clearInterval(id);
            $('.donkeyKong').css({ bottom: '-400px' });
            bananeDone = true;
        } else if (!banana && donkeyKongY < posY) {
            donkeyKongY += 5;
        } else {
            donkeyKongY -= 5;
            banana = true;
        }
        rotation += 4;
    }
}


/* ARROW KEYS
========================================================================== */
function arrowDown(e) {
    // setImage('.character .img', 'foxRun')
    if ((e.keyCode == KEYCODE_LEFT || $(e.target).hasClass('js-left')) && !lookAt[0]) {
        lookAt[0] = true;
        faceLeft = true;
        $('.character .img__container').css({ transform: 'scale(1)' });
    } else if ((e.keyCode == KEYCODE_RIGHT || $(e.target).hasClass('js-right')) && !lookAt[1]) {
        lookAt[1] = true;
        faceLeft = false;
        $('.character .img__container').css({ transform: 'scale(-1, 1)' });
    }
}
function arrowUp(e) {
    // setImage('.character .img', 'fox')
    if (e.keyCode == KEYCODE_LEFT || $(e.target).hasClass('js-left')) lookAt[0] = false;
    if (e.keyCode == KEYCODE_RIGHT || $(e.target).hasClass('js-right')) lookAt[1] = false;
}

movementLoop = () => {
    if (lookAt[0] || lookAt[1]) {
        $('.character .img__container').css({ 'margin-left': pos + 'px' });
        if (!isPlaying('key')) playSound('key', false);
    } else {
        if (isPlaying('key')) stopSound('key');
    }
    if (lookAt[1]) {
        pos += 25;
        if (pos >= $(window).width() - 375) pos = $(window).width() - 375;
    } else if (lookAt[0]) {
        pos -= 25;
        if (pos <= -25) pos = -25;
    }
}

let shieldState = false;
shieldLoop = () => {
    if (lookAt[3]) {
        shieldState ? setImage('.character .img', 'foxShield1') : setImage('.character .img', 'foxShield2');
        shieldState = !shieldState;
    }
}

/* Switch
========================================================================== */
let switchCount = 0;
let mode = localStorage.getItem('mode') ? localStorage.getItem('mode') : 'starfox';
let checked = mode === 'mario';

$('.checkbox').prop("checked", checked);

$('.checkbox').click(function () {
    cooldown();
    switchCount += 1;
    checked = $(this).is(':checked');
    localStorage.setItem('mode', checked ? 'mario' : 'starfox');
    if (switchCount >= 5) {
        mode = 'kirby';
    } else if (checked) {
        mode = 'mario';
    } else {
        mode = 'starfox';
    }
    switchMode();
})

switchMode = () => {
    switch (mode) {
        case 'kirby':
            $('.fa-kirby').show();
            $('.fa-starfox, .fa-mario').hide();
            $('.label').css({ width: '35px' });
            $('.label .ball').hide();
            $('.arrow-key-container .row.starfox').hide();
            $('.arrow-key-container .row.kirby').css({ display: 'flex' });
            $('.selfcounter__container').css({ color: '#FD9FD6' });
            setImage('.character .img', 'kirby');
            $('.counter__click .text').text('POYO!');
            text = 'poyo';
            $('.character .img').css({ transform: 'scale(1)' });
            kirbyScale = 1;
            break;
        case 'mario':
            $('.fa-kirby').hide();
            $('.fa-starfox, .fa-mario').show();
            $('.label').css({ width: '70px' });
            $('.label .ball').show();
            $('.arrow-key-container .row.starfox').show();
            $('.arrow-key-container .row.kirby').hide();
            $('.selfcounter__container').css({ color: '#D91430' });
            setImage('.character .img', 'mario');
            $('.counter__click .text').text('YAHOO!');
            text = 'yahoo';
            $('.character .img').css({ transform: 'scale(1)' });
            kirbyScale = 1;
            break;
        case 'starfox':
            $('.fa-kirby').hide();
            $('.fa-starfox, .fa-mario').show();
            $('.label').css({ width: '70px' });
            $('.label .ball').show();
            $('.arrow-key-container .row.starfox').show();
            $('.arrow-key-container .row.kirby').hide();
            $('.selfcounter__container').css({ color: '#EB9B24' });
            setImage('.character .img', 'fox');
            $('.counter__click .text').text('HIYAAA!');
            text = 'hiyaa';
            $('.character .img').css({ transform: 'scale(1)' });
            kirbyScale = 1;
            break;
    }
}
switchMode();

/* Loop
========================================================================== */
let fps = 0
loop = () => {
    movementLoop();
    if (fps == 7) {
        shieldLoop();
        fps = 0;
    }
    fps++;

}
let loopInterval = setInterval(loop, 10);

init();

/*******************
 * Cooldown
 */
cooldown = debounce(function () {
    if (currentClicks > 25 && mode == 'starfox')
        setImage('.character .img', 'fox');
    if (currentClicks > 25 && mode == 'kirby')
        setImage('.character .img', 'kirby');
    currentClicks = 0;
    switchCount = 0;
}, 450);

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

/* Mobile
========================================================================== */
isMobileOrTablet = () => {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

if (isMobileOrTablet()) {
    $('.arrow-key-container').hide();
}

/* Sidebar
========================================================================== */
function toggleSidebar() {
    $(".header  .btn-round").toggleClass("active");
    $(".sidebar, .header").toggleClass("active");
}

$(".header .btn-round").on("click tap", function () {
    toggleSidebar();
});

$('.share-btn').on('click', function () {
    return window.navigator.share({
        title: document.title,
        text: 'HIYAAA!',
        url: 'https://starfox.qwetle.fr/',
    });
})

/*******************
 * ASCII art
 */
var art = `
.oooooo..o     .                      oooooooooooo                      
d8P'    'Y8   .o8                      '888'     '8                      
Y88bo.      .o888oo  .oooo.   oooo d8b  888          .ooooo.  oooo    ooo
 '"Y8888o.    888   'P  )88b  '888""8P  888oooo8    d88' '88b  '88b..8P' 
     '"Y88b   888    .oP"888   888      888    "    888   888    Y888'   
oo     .d8P   888 . d8(  888   888      888         888   888  .o8"'88b  
8""88888P'    "888" 'Y888""8o d888b    o888o        'Y8bod8P' o88'   888o
`;

function getCharacters(art) {
    var i = art.length;
    var i_letter = 0;
    var s = '';
    var characters = [];
    do {
        i = (i + 1) % art.length;
        var c = art[i];

        var isWhitespace = /\s/.test(c);
        if (isWhitespace) {
            s += c;
            continue;
        }
        else {
            if (s.length > 0) {
                c = s + c;
                s = '';
            }
            i_letter = (i_letter + 1) % art.length;
            characters.push(c);
        }
    }
    while (i);
    return characters;
}

var characters = getCharacters(art);

var output = '';
function printCharacterByIndex(characters, index, delay) {
    if (characters[index] === undefined) return;
    output += characters[index];
    console.clear();
    console.log('%c ' + output, "font-family:monospace;color: red;")
    window.setTimeout(printCharacterByIndex.bind(null, characters, index + 1, delay), delay);
}
console.clear();
printCharacterByIndex(getCharacters(art), 0, 50);
