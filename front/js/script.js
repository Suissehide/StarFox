/*******************
 * SCRIPT
 *******************/

var clicks = 0;
var local_clicks = 0;

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
var ns = 30;
var sounds = [];
var source = './assets/sounds/fox0b.wav';
var id = 0;

for (i = 0; i < ns; i++) {
    sounds.push(new Audio(source));
}

playSound = () => {
    sounds[id].play();
    ++id;
    if (id >= ns)
        id = 0;
}

$('.container').click(function () {
    playSound();
    emitClicks();
    if (local_clicks > 25) {
        $('.starfox .img').css({ 'background-image': 'url("./assets/images/Fox2.png")' })
    }
    setClicks(clicks);
    local_clicks++;
});

setClicks = (val) => {
    $('.counter__click span').text(val);
}

updateUser = (val) => {
    $('.counter__user').text(val + (val > 1 ? " users connected" : " user connected"));
}

/*******************
 * Cooldown
 */
cooldown = debounce(function () {
    if (local_clicks > 25) $('.starfox .img').css({ 'background-image': 'url("./assets/images/Fox.png")' })
    local_clicks = 0;
}, 350);
$('.container').bind("click", cooldown);

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
// console.clear();
// printCharacterByIndex(getCharacters(art), 0, 50);
