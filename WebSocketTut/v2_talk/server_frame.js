var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 9090});

wss.on('connection', function(connection) {
    connection.on('message', function(raw_msg) {
        let msg = {};
        try {
            msg = JSON.parse(raw_msg);
        } catch(e) {
            console.log("Invalid message format: " + raw_msg);
            return;
        }

        switch(msg.operation) {
            case "login":
                //handle user login
                //broadcast new user
                break;
            case "talk":
                //handle talk
                break;
            default:
                break;
        }
    });
});
