var clicks = 0;

$('.container').click(function() {
    let audio = new Audio('./assets/fox0b.dsp.wav');
    audio.play();

    if (clicks > 25)
        $('.starfox .img').css({'background-image': 'url("./assets/favicon.png")'})
    clicks++;
});