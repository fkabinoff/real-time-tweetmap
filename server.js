var fs = require("fs"),
    express = require("express"),
    app = express(),
    server = require("http").Server(app),
    path = require("path"),
    io = require("socket.io").listen(server, { log: true }),
    theport = process.env.PORT || 2000,
    twitter = require("ntwitter");

server.listen(theport);

app.get("/", function (req,res) {
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

app.get("/map", function (req,res) {
    fs.readFile(__dirname + '/map.html', 'utf8', function(err, text){
        res.send(text);
    });
});


app.use(express.static(path.join(__dirname, 'public')));


var tw = new twitter({
        consumer_key: "HtqCt54YHMbSqBlEc3l5QAG2h",
        consumer_secret: "4jSxMBaiZBNac4YM3vtwkp9KU9VPVL0Tkyn4jza2ZZFiTEqaOe",
        access_token_key: "455114465-obZ8V2OjGik3MTilPCRS11rlgrwOREI9UZKDgSxu",
        access_token_secret: "mjOyVnBEPV91x4YB4aAICF8nCVVfxQr5vIcQPYoJKpzfp"
    }),
    stream = null,
    users = [];


io.sockets.on("connection", function (socket) {

    if(users.indexOf(socket.id) === -1) {
        users.push(socket.id);
    }

    logConnectedUsers();

    socket.on("start stream", function() {
        if(stream === null) {
            tw.stream("statuses/filter", {
                locations:'-124.46, 24.31, -66.57, 49.23'
            }, function(s) {
                stream = s;
                stream.on("data", function(data) {
                    if(users.length > 0) {
                        socket.broadcast.emit("new tweet", data);
                        socket.emit("new tweet", data);
                    }
                });
                stream.on("error", function(error, code) {
                    console.log(error + ", " + code);
                });
                stream.on("warning", function(error, code) {
                    console.log(error + ", " + code);
                });
            });
        }
    });

    socket.on("disconnect", function(o) {
        var index = users.indexOf(socket.id);
        if(index != -1) {
            users.splice(index, 1);
        }
        if(users.length === 0) {
            stream.destroy();
            stream = null;
        }
        logConnectedUsers();
    });


    socket.emit("connected", {

    });
});


function logConnectedUsers() {
    console.log("============= CONNECTED USERS ==============");
    console.log("==  ::  " + users.length);
    console.log("============================================");
}