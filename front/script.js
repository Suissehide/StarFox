var clicks = 0;
var local_clicks = 0;

$('.container').click(function() {
    let audio = new Audio('./assets/fox0b.dsp.wav');
    audio.play();

    if (local_clicks > 25)
        $('.starfox .img').css({'background-image': 'url("./assets/favicon.png")'})

    local_clicks++;
    setClicks(clicks + local_clicks);
    
    //TODO - cooldown
    conn.send(local_clicks)
    local_clicks = 0;
});

setClicks = (val) => {
    $('.counter__click span').text(val);
}

/*** WEBSOCKET ***/

var conn = new WebSocket('ws://localhost:8080');
conn.onopen = function(e) {
    console.log("Connection established!");
};

conn.onmessage = function(e) {
    clicks = parseInt(e.data)
    setClicks(clicks + local_clicks);
};