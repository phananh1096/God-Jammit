navigator.requestMIDIAccess()
.then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()){
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log('Error: Could not access MIDI devices.');
}

var midiToTone = {
    21: "A0",
    22: "A0#",
    23: "B0",
    24: "C1",
    25: "C#1",
    26: "D1",
    27: "D#1",
    28: "E1",
    29: "F1",
    30: "F#1",
    31: "G1",
    32: "G#1",
    33: "A1",
    34: "A#1",
    35: "B1",
    36: "C2",
    37: "C#2",
    38: "D2",
    39: "D#2",
    40: "E2",
    41: "F2",
    42: "F#2",
    43: "G2",
    44: "G#2",
    45: "A2",
    46: "A#2",
    47: "B2",
    48: "C3",
    49: "C#3",
    50: "D3",
    51: "D#3",
    52: "E3",
    53: "F3",
    54: "F#3",
    55: "G3",
    56: "G#3",
    57: "A3",
    58: "A#3",
    59: "B3",
    60: "C4",
    61: "C#4",
    62: "D4",
    63: "D#4",
    64: "E4",
    65: "F4",
    66: "F#4",
    67: "G4",
    68: "G#4",
    69: "A4",
    70: "A#4",
    71: "B4",
    72: "C5",
    73: "C#5",
    74: "D5",
    75: "D#5",
    76: "E5",
    77: "F5",
    78: "F#5",
    79: "G5",
    80: "G#5",
    81: "A5",
    82: "A#5",
    83: "B5",
    84: "C6",
    85: "C#6",
    86: "D6",
    87: "D#6",
    88: "E6",
    89: "F6",
    90: "F#6",
    91: "G6",
    92: "G#6",
    93: "A6",
    94: "A#6",
    95: "B6",
    96: "C7",
    97: "C#7",
    98: "D7",
    99: "D#7",
    100: "E7",
    101: "F7",
    102: "F#7",
    103: "G7",
    104: "G#7",
    105: "A7",
    106: "A#7",
    107: "B7",
    108: "C8"
}

// midi message event
function getMIDIMessage(ev) {
    if (midiToTone.hasOwnProperty(ev["data"][1]) && ev["data"][0] == 144) {
        socket.emit('receive_keynote', midiToTone[ev["data"][1]]);
    }
}

/*
//WEB AUDIO

var context = null;
var oscillator = null;
function getOrCreateContext() {
if (!context) {
context = new AudioContext();
oscillator = context.createOscillator();
oscillator.connect(context.destination);
}
return context;
}
const list = document.getElementById('midi-list');
const debugEl = document.getElementById('debug');

let isStarted = false;

var active_voices = {};

function noteOn(midiNote) {
getOrCreateContext();

/*
var freq = Math.pow(2, (midiNote-69)/12)*440;
var active_voices[freq] = context.createOscillator();
active_voices[freq].connect(context.destination);
active_voices[freq].frequency.setTargetAtTime(freq, context.currentTime, 0);
if (!isStarted) {
active_voices[freq].start(0);
isStarted = true;
} else {
context.resume();
}




const freq = Math.pow(2, (midiNote-69)/12)*440;

oscillator.frequency.setTargetAtTime(freq, context.currentTime, 0);
if (!isStarted) {
oscillator.start(0);
isStarted = true;
} else {
context.resume();
}
//---- orig end ----//\
}

function noteOff(midiNote) {
/*
active_voices[note].stop();
delete active_voices[note];
*/
//var freq = Math.pow(2, (midiNote-69)/12)*440;
/*
forn each(var osc in active_voices) {
if (osc.frequency == freq)
osc.oscillator.stop(0);
}

context.suspend();
}

function connectToDevice(device) {
console.log('Connecting to device', device);
device.onmidimessage = function(m) {
const [command, key, velocity] = m.data;
if (command === 145) {
debugEl.innerText = 'KEY UP: ' + key;
noteOn(key);
} else if(command === 129) {
debugEl.innerText = 'KEY DOWN';
noteOff(key);
}
}
}

function replaceElements(inputs) {
// cannot read firstChild
while(list.firstChild) {
list.removeChild(list.firstChild)
}
const elements = inputs.map(e => {
console.log(e);
const el = document.createElement('li')
el.innerText = `${e.name} (${e.manufacturer})`;
el.addEventListener('click', connectToDevice.bind(null, e));
return el;
});

elements.forEach(e => list.appendChild(e));
}

navigator.requestMIDIAccess()
.then(function(access) {
console.log('access', access);
replaceElements(Array.from(access.inputs.values()));
access.onstatechange = function(e) {
replaceElements(Array.from(this.inputs.values()));
}

})

*/

// Below is keyboard emulation for C4-C5 q-i keys
var emulatedKeys = {
    q: "C4",
    w: "D4",
    e: "E4",
    r: "F4",
    t: "G4",
    y: "A4",
    u: "B4",
    i: "C5",
    o: "D5",
    p: "E5",
    a: "C#4",
    s: "D#4",
    d: "E#4",
    f: "F#4",
    g: "G#4",
    h: "A#4",
    j: "B#4",
    k: "C#5",
    l: "D#5",
    z: "C2",
    x: "D2",
    c: "E2",
    v: "F2",
    b: "G2",
    n: "A2",
    m: "B2"
}

function playNote(e) {
    if (emulatedKeys.hasOwnProperty(e.key)) {
        socket.emit('receive_keynote', emulatedKeys[e.key]);
    }
}

socket.on('can_play', function() {
    $(document).on('keydown', playNote);
});
