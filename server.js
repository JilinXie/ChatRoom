
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 9090});
var uuid = require('uuid');

// stores user_name and connection object between it and the server.
var users_db = {}

function sendMsg(connection, msg) {
    connection.send(JSON.stringify(msg));
}

function broadcast_newuser() {
    let usernames = Object.keys(users_db);
    for (let username in users_db) {
        sendMsg(users_db[username],
                {operation: "listuser", data: {usernames: usernames}});
    }
}

function broadcast_talk(content, talker) {
    for (let username in users_db) {
        if (username === talker) {
            continue;
        }
        sendMsg(users_db[username],
                {operation: "talk",
                 data: {content: content,
                        talker: talker}})
    }
}

function peer_talk(peername, content, talker) {
    let connection = users_db[peername];
    if (connection !== undefined) {
        sendMsg(connection, 
                {operation: "talk",
                 data: {content: content,
                        talker: talker}})
    }
}

function login_user(connection, username) {
    if (_is_relogin(connection, username) === true) {
        return false;
    }
    users_db[username] = connection;
    return true;
}

function _is_relogin(connection, username) {
    if (users_db[username] !== undefined) {
        console.log(username + " exists");
        return true;
    }
    for (let uname in users_db) {
        if (connection.id === users_db[uname].id) {
            console.log(uname + " connection relogged in");
            return true;
        }
    }
    return false;
}


// TODO: if we have a connection->username map, this would be a O(1) function.
function _who_am_i(connection) {
    for (let uname in users_db) {
        if (connection.id === users_db[uname].id) {
            return uname;
        }
    }
    return '----';
}


wss.on('connection', function(connection) {
    connection.id = uuid.v4();
    connection.on('close', function(evt) {
        for (let username in users_db) {
            if (users_db[username] === connection) {
                delete users_db[username];
                console.log(username + ': connection closed');
            }
        }
    });
    connection.on('message', function(raw_msg) {
        /*TODO: data validity checking*/
        let msg = {};
        try {
            msg = JSON.parse(raw_msg);
        } catch(e) {
            console.log("Invalid message format: " + raw_msg);
            return;
        }

        switch (msg.operation) {
            case "login":
                let username = msg.data.username;
                if (username.trim() === "") {
                    sendMsg(connection, {operation: "login",
                                         data: {state: false}});
                }
                if (login_user(connection, username) === true) {
                    sendMsg(connection, {operation: "login",
                                         data: {state: true}});
                    broadcast_newuser();    
                    break;
                }
                sendMsg(connection, {operation: "login",
                                     data: {state: false}});
                break;
            case "talk":
                if (msg.data.peername === "") {
                    broadcast_talk(msg.data.content, _who_am_i(connection));
                } else {
                    peer_talk(msg.data.peername, msg.data.content, _who_am_i(connection));
                }
                break;
            default:
                break;
        }
    });
});
