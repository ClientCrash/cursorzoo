const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let cursors = [];

server.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        let cursorData = JSON.parse(message);
        let cursorIndex = cursors.findIndex(cursor => cursor.id === cursorData.id);

        if (cursorIndex >= 0) {
            cursors[cursorIndex] = cursorData; // update existing cursor
        } else {
            cursors.push(cursorData); // add new cursor
        }

        // send update to all clients
        server.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(cursors));
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // send disconnect message
        let disconnectMessage = { id: ws.id, cursorPosition: { x: -1, y: -1 }, disconnect: true };
        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify([disconnectMessage]));
            }
        });
        // remove cursor from server's list
        cursors = cursors.filter(cursor => cursor.id !== ws.id);
    });
});
