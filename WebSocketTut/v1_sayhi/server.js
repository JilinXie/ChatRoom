var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 9090});

wss.on('connection', function(connection) {
    connection.on('message', function(raw_msg) {
        console.log(raw_msg);
        connection.send("world");
    });
});
