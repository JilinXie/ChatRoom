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
                login(connection, msg.data.username);
                broadcast_newuser();
                break;
            case "talk":
                broadcast_talk(msg.data.content, _who_am_i(connection))
                break;
            default:
                break;
        }
    });
});
function sendMsg(connection, msg) {
    connection.send(JSON.stringify(msg));
}

var users_db = {};
function login(connection, username) {
    users_db[username] = connection;
}

function broadcast_newuser() {
    let usernames = Object.keys(users_db);
    for (let username in users_db) {
        sendMsg(users_db[username],
                {operation: "listuser", 
                 data: {usernames: usernames}});
    }
}

function _who_am_i(connection) {
    for (let uname in users_db) {
        if (connection.id === users_db[uname].id) {
            return uname;
        }
    }
    return '----';
}

function broadcast_talk(content, talker) {
    for (let username in users_db) {
        sendMsg(users_db[username],
                {operation: "talk",
                 data: {content: content,
                        talker: talker}})
    }
}
