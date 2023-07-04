// Autor: ClientCrash
// https://github.com/clientcrash/cursorzoo
// Your free to use this if you give credit. | A link to the github page or a console.log is enough, no need to get fancy. So not removing the console.logs which are already present already fine. Have fun! :D
const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJUExURf///wAAAAAAAH5RqV0AAAADdFJOU///ANfKDUEAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABeSURBVDhP7c1BCsAgDETRNPc/dJtktBI6SbeCn4Iwfaho0x8gJTJwVcJBJQIUAoCLAaiYgIkXELGAbzGBWBjXAtiHIedAHGFJGcAtWFL2008mxtqC56EGsA6INgCqN/ueB3VGU4O1AAAAAElFTkSuQmCC"

let mouseX = 0;
let mouseY = 0;
const id = generateRandomId();

function generateRandomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return 'cursorzoo-' + id;
}

onmousemove = function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

var lastStateSend = {};

function getCurrentCursorPosition() {
    return {
        x: mouseX,
        y: mouseY
    };
}

function sendSelf(socket) {
    const pos = getCurrentCursorPosition();
    const self = { id, cursorPosition: pos };
    if(lastStateSend.cursorPosition == undefined) lastStateSend = self;
    console.log(lastStateSend.cursorPosition.x + " " + lastStateSend.cursorPosition.y + " " + self.cursorPosition.x + " " + self.cursorPosition.y);
    if (self.cursorPosition.x == lastStateSend.cursorPosition.x && self.cursorPosition.y == lastStateSend.cursorPosition.y) return;
    console.log('Cursorzoo | Sending self to server');
    const payload = JSON.stringify(self);
    socket.send(payload);
    lastStateSend = self;
}
function setCursorZooImage(url) {
    console.log('Cursorzoo | Setting image to ' + url);
    image = url;
}
function connectToWebSocket(url) {
    console.log('Crusorzoo made by ClientCrash ( https://github.com/clientcrash/cursorzoo )');
    console.log('Cursorzoo | Connecting to server...');
    const socket = new WebSocket(url);
    let self = { id, cursorPosition: getCurrentCursorPosition() };

    socket.addEventListener('open', (event) => {
        console.log('Cursorzoo | Connected to server');

        // Periodically send self to server
        setInterval(() => {
            sendSelf(socket);
        }, 1);  // Send every second
    });


    socket.addEventListener('message', (event) => {
        JSON.parse(event.data).forEach((cursor) => {
            if (cursor.id == id) return; // ignore self

            // if this is a disconnect message, remove the cursor element and return
            if (cursor.disconnect) {
                const cursorElement = document.getElementById(cursor.id);
                if (cursorElement) {
                    cursorElement.remove();
                }
                return;
            }

            if (document.getElementById(cursor.id)) {
                document.getElementById(cursor.id).style.left = cursor.cursorPosition.x + 'px';
                document.getElementById(cursor.id).style.top = cursor.cursorPosition.y + 'px';
            } else {
                // create cursor element for "new" cursor
                const cursorElement = document.createElement('img');
                cursorElement.id = cursor.id;
                cursorElement.style.position = 'absolute';
                cursorElement.style.width = '40px';
                cursorElement.style.height = '40px';
                cursorElement.src = image;
                // Append the new cursor element to the body
                document.body.appendChild(cursorElement);
            }
        });
    });


    socket.addEventListener('close', (event) => {
        console.log('Cursorzoo | Disconnected from server');
    });
}