var socket = io();

$(document).click(function(event) {
    if (event.target.id != "") {
        socket.emit('play_song', event.target.id);
    }
});

socket.on('song_here', function(addr) {
    var audio = document.getElementById('audio');
    audio.src = addr;
    audio.play();
});
