const express = require('express')
const app = express();
const path = require('path')
const pug = require('pug')
const uuid = require('uuid/v4')
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000
const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')

//---------Initializes Socket.io instance---------//

var server = require('http').Server(app);
var io = require('socket.io')(server);

//---------Initializes Firebase db instance---------//
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://god-jammit.firebaseio.com"
});
var db = admin.database();


//----------Initializes Express instance
//https://stackoverflow.com/questions/18165138/res-sendfile-doesnt-serve-javascripts-well
app.use(express.static(path.join(__dirname, '/god-jammit')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view engine', 'pug');
//https://stackoverflow.com/questions/25270434/nodejs-how-to-render-static-html-with-express-4
app.post('/', function(req, res) {
    if (JSON.parse(req.body.logged_in)) {
        res.send('/' + uuid());
    }
    else {
        res.send('/login')
    }
});
app.get('/login', (req, res) => res.sendFile('login.html', {root: __dirname + '/god-jammit/'}));
app.get('/:id', function(req, res) {
    res.sendFile('project.html', {root: __dirname + '/god-jammit/'});
});
app.post('/search', function(req, res) {
    db.ref("projects").orderByChild("made_at").once('value', function(snapshot) {
        var results = {};
        var songs = snapshot.val();
        var keys = Object.keys(songs);
        for (var i = 0; i < keys.length; i++) {
            if (songs[keys[i]]["name"].includes(req.body.search)) {
                results[keys[i]] = songs[keys[i]];
                results[keys[i]].song_id = keys[i];
            }
        }
        res.render('search', {"result": req.body.search, "songs": results});
    });
});
app.post('/publish', function(req, res) {
    db.ref("projects/" + req.body.id).set({
        "name": req.body.name,
        "owner": req.body.owner,
        "collaborators": req.body.collaborators,
        "made_at": Date(),
        "audio": req.body.audio
    });
    res.redirect('/');
});

var rooms = {};
var users;
// Function that emits message event to clients upon connection
io.on('connection', function(socket) {
    socket.on('play_song', function(id) {
        db.ref("projects").child(id).once('value', function(snapshot) {
            if (snapshot.val() != null) {
                socket.emit('song_here', snapshot.val().audio);
            }
        });
    });
    socket.on('create', function(room, name) {
        socket.join(room);
        if (rooms[room] == null || Object.keys(rooms[room]).length == 0) {
            rooms[room] = {};
            rooms[room]["owner"] = { "name": name, "ready": false, "socket_id": socket.id, "state": "not recording" };
            socket.emit('get_access', true);
            socket.emit('owner', rooms[room]['owner']);
        }
        else {
            rooms[room][socket.id] = { "name": name, "ready": false };
            socket.emit('get_access', false);
            socket.broadcast.to(rooms[room]["owner"].socket_id).emit('collabs', rooms[room]);
        }
        console.log(name + " has joined " + room);
        socket.emit('update', rooms[room]);
        socket.broadcast.to(room).emit('alert', name, socket.id);
        if (rooms[room]["owner"].state == 'recording') {
            socket.emit('recording');
        }
        if (rooms[room]["owner"].state == 'finished recording') {
            socket.emit('show_finish');
        }

        // Keyboard notes
        socket.on('receive_keynote', function(note) {
            io.in(room).emit('send_keynote', note);
            console.log('note played');
        });
        socket.on('finish_song', function(audio) {
            io.in(room).emit('play', audio);
        });

        // Buttons
        socket.on('record', function() {
            var ready = true;
            var names = Object.keys(rooms[room]);
            for (var i = 0; i < names.length; i++) {
                if (rooms[room][names[i]].ready == false) {
                    ready = false;
                }
            }
            if (ready) {
                io.in(room).emit('recording');
                rooms[room]["owner"].state = 'recording';
            }
            else {
                socket.emit('not_ready');
            }
        });
        socket.on('ready', function() {
            if (!Object.keys(rooms[room]).includes(socket.id)) {
                rooms[room]["owner"].ready = true;
                io.in(room).emit('show_ready', "owner");
            }
            else {
                rooms[room][socket.id].ready = true;
                io.in(room).emit('show_ready', socket.id);
            }
        });
        socket.on('finish', function() {
            io.in(room).emit('show_finish');
            rooms[room]["owner"].state = 'finished recording';
            var names = Object.keys(rooms[room]);
            for (var i = 0; i < names.length; i++) {
                if (rooms[room][names[i]].ready == false) {
                    socket.broadcast.to(names[i]).emit('can_play');
                }
            }
        });
        socket.on('publish', function() {
            socket.emit('check');
        });
        socket.on('send', function(sure, source) {
            if (sure) {
                socket.emit('submit', source);
            }
        });

        socket.on('song_name', function(name) {
            socket.broadcast.to(room).emit('update_name', name);
        });

        // Allows user to play on Keyboard
        if (!Object.keys(rooms[room]).includes(socket.id)) {
            if ((rooms[room]['owner'].ready && rooms[room]['owner'].state == 'recording') || (!rooms[room]['owner'].ready && rooms[room]['owner'].state != 'recording')) {
                socket.emit('can_play');
            }
        }
        else {
            if ((rooms[room][socket.id].ready && rooms[room]['owner'].state == 'recording') || (!rooms[room][socket.id].ready && rooms[room]['owner'].state != 'recording')) {
                socket.emit('can_play');
            }
        }
        socket.on('disconnect', function() {
            console.log(name + " has left " + room);
            if (!Object.keys(rooms[room]).includes(socket.id)) {
                if (Object.keys(rooms[room]).length != 1) {
                    var clients = io.sockets.adapter.rooms[room].sockets;
                    socket.broadcast.to(room).emit('leave');
                }
                delete rooms[room]['owner'];
            }
            else {
                delete rooms[room][socket.id];
                io.in(room).emit('remove', rooms[room]);
            }
        });
    });
});

//https://stackoverflow.com/questions/38541098/how-to-retrieve-data-from-firebase-database
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
/*
var db = admin.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function(snapshot) {
console.log(snapshot.val());
});
*/
