//https://stackoverflow.com/questions/31174698/unable-to-prevent-an-input-from-submitting-when-press-the-enter-key-on-it
var id = document.URL.split('/');
var socket = io();
var recorder;
var audio_source = null;

/*
//https://stackoverflow.com/questions/43903963/post-html5-audio-data-to-server
var enc = ['ogg', 'webm'];
var mime = "";
enc.forEach(e => {
if (!mime && MediaRecorder.isTypeSupported(`audio/${e};codecs="opus"`)) {
mime = `audio/${e};codecs="opus"`;
}
});
console.log(mime);*/
/*var funcMidiVisualizer = require("func-midi-visualizer");

const viz_config = {
window: window,
root: document.getElementById('#midi_viz'),
width: 300,
height: 300,
midi: {
data: null
},
audio: {
data: null
},
renderer: null
};

initMidiVisualizer(viz_config).then((visualizer) => {
const playingVisualizer = visualizer.play();

}).catch((error) => console.error('Oh man, something bad happened:', error));*/

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        socket.emit('create', id[3], user.displayName);
    }
    else {
        window.open("/login", "_self");
    }
});

socket.on('owner', function(owner) {
    $('#owner').val(owner.name);
});

socket.on('collabs', function(users) {
    var collabs = "";
    var names = Object.keys(users);
    for (var i = 0; i < names.length; i++) {
        if (names[i] != "owner" && (users['owner'].state == 'not recording' || users[names[i]].ready)) {
            collabs += users[names[i]].name + ", ";
        }
    }
    $('#collaborators').val(collabs.slice(0, -2));
});

// SHOW USERS ON PAGE
socket.on('update', function(users) {
    var names = Object.keys(users);
    for (var i = 0; i < names.length; i++) {
        $('#users').append('<h4 id=' + names[i] + '>' + users[names[i]].name + '</h4>');
        if (users[names[i]].ready == true) {
            $('#users').find('#' + names[i]).css('color', 'green');
        }
    }
});

socket.on('get_access', function(is_owner) {
    if (is_owner) {
        $('#record').removeClass('hidden');
        $('#publish').removeClass('hidden');
        $('#song_name').removeClass('disabled');
    }
    $('#ready').removeClass('disabled');
});

socket.on('alert', function(new_user, id) {
    $('#users').append('<h4 id=' + id + '>' + new_user + '</h4>');
});

socket.on('remove', function(users) {
    $('#users').empty();
    var names = Object.keys(users);
    for (var i = 0; i < names.length; i++) {
        $('#users').append('<h4 id=' + names[i] + '>' + users[names[i]].name + '</h4>');
        if (users[names[i]].ready == true) {
            $('#users').find('#' + names[i]).css('color', 'green');
        }
    }
});

socket.on('leave', function() {
    window.open("/", "_self");
});

var piano = SampleLibrary.load({
    instruments: "piano"
});

socket.on('send_keynote', function(note) {
    // WORK ON VISUALIZER HERE
    piano.toMaster();
    piano.triggerAttack(note);
});

socket.on('recording', function() {
    $('#record').html("Stop");
    $('#record').removeClass("btn-danger");
    $('#record').addClass("btn-secondary");
    $('#ready').html("Recording");
    $('#ready').removeClass("btn-warning");
    $('#ready').addClass("btn-danger");
});
socket.on('not_ready', function() {
    alert("Not everyone is ready!");
});
socket.on('show_finish', function() {
    $('#ready').html("Finished!");
    $('#ready').removeClass("btn-success");
    $('#ready').removeClass("btn-danger");
    $('#ready').addClass("btn-primary");
});
socket.on('show_ready', function(id) {
    $('#users').find('#' + id).css('color', 'green');
});
socket.on('check', function() {
    if ($('#ready').html() == "Finished!") {
        var check = confirm("Are you ready to publish?");
        socket.emit('send', check, audio_source);
    }
    else {
        alert("You didn't finish recording!");
    }
});
socket.on('submit', function(source) {
    $('#audio_song').val(source);
    $('#song_finish').submit();
});

socket.on('update_name', function(name) {
    $('#song_name').val(name);
});

$(document).ready(function() {
    $('#song_name').focus(function() {
        $(document).off('keydown', playNote);
    }).blur(function() {
        $(document).on('keydown', playNote);
        socket.emit('song_name', $('#song_name').val());
    });
    $(document).keypress(function(key) {
        if (key.keyCode == 13) {
            key.preventDefault();
        }
    });
    $('#id').val(id[3]);
    $('#ready').click(function() {
        if ($('#ready').html() == "Ready") {
            $('#ready').html("Waiting");
            $('#ready').removeClass("btn-success");
            $('#ready').addClass("btn-warning");
            socket.emit('ready');
        }
    });

    $('#record').click(function() {
        if ($('#record').html() == "Record") {
            navigator.mediaDevices.getUserMedia({
                audio: true
            })
            .then(function (stream) {
                recorder = new MediaRecorder(stream);
                recorder.start();
                console.log("recorder started");
                recorder.addEventListener('dataavailable', onRecordingReady);
            });
            socket.emit('record');
        }
        else {
            recorder.stop();
            console.log("recorder stopped");
            $('#record').hide();
            socket.emit('finish');
        }
    });
    $('#publish').click(function() {
        socket.emit('publish');
    });
});

function onRecordingReady(e) {
    socket.emit('finish_song', URL.createObjectURL(e.data));
}

socket.on('play', function(audio_src) {
    var audio = document.getElementById('audio');
    // e.data contains a blob representing the recording
    audio.src = audio_src;
    //console.log(audio.src);
    audio_source = audio_src;
    audio.play();
});
