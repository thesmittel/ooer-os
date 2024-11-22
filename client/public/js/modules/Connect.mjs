/**
 * Served to client on page load. Handles communication with the server.
 * @file Connect.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:Connect
 * @see <a href="./client.Client_Connect.html">Module</a>
 */
/**
 * Served to client on page load. Handles communication with the server.
 * @file Connect.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:Connect
 * @see <a href="./client.Client_Connect.html">Module</a>
 * @namespace ClientCode
 */
/**
 * @module Connect
 * @memberof client
 * @description Handles server connection and communication
 * @name Client:Connect
 * @author Smittel
 */

/**
 * @borrows handle, cookieLogin from Auth.mjs
 * @import handle
 */
import { cookieLogin as cookie, handle as auth } from "./connect/Auth.mjs";
import { handle as client } from "./connect/Client.mjs";
import { handle as system } from "./connect/System.mjs";
import { handle as app } from "./connect/App.mjs";
import { DialogBox } from "../components/ui.mjs";
import { Socket } from "./system/socket.mjs";
// import * as Test from "./test.mjs"
/**
 * @constant socket Socket.io instance
 * @name Internal:socket
 */
console.log(globalThis.process !== undefined ? "process" : "Window");
// const socket = io();
// test. changing
const socket = new WebSocket(document.location);

socket.emit = function (module, action, data) {
    socket.send(JSON.stringify({
        module: module,
        action: action,
        data: data,
    }));
};

const SOCKET = new Socket(document.location)
SOCKET.connectionOpened(() => {
    SOCKET.registerModule("Auth");
    // SOCKET.registerModule(Test)
    SOCKET.Auth.send("test", "data");
    SOCKET.Auth.listen("return", (d) => {console.log("RETURNED", d)})
})
/**
 * Sends system data back to the server via a websocket.
 * System data includes general commands and requests to the server, like starting an app.
 * @example {
 *  req: "request_name",
 *  data: {
 *      // additional data
 *  }
 * }
 * @method System
 * @param {Object} data
 * @name Export:System
 */
function System(action, data) {
    // console.log(data)
    socket.emit("System", action, data);
}

/**
 * Sends authentification data back to the server via a websocket. Used for logging in and out, signing up, verifying identity, handling cookies
 * @example {
 *  req: "request_name",
 *  data: {
 *      // additional data
 *  }
 * }
 * @method Auth
 * @param {Object} data
 * @name Export:Auth
 */
function Auth(action, data) {
    socket.emit("Auth", action, data);
}

/**
 * Sends Client data back to the server via a websocket. Client data includes user settings, details and similar
 * @example {
 *  req: "request_name",
 *  data: {
 *      // additional data
 *  }
 * }
 * @method Client
 * @param {Object} data
 * @name Export:Client
 */
function Client(action, data) {
    socket.emit("Client", action, data);
}
/**
 * Sends app data back to the server via a websocket. Used for communication between apps and the server. Currently only accessible by system level apps.
 * @example {
 *  req: "request_name",
 *  data: {
 *      // additional data
 *  }
 * }
 * @method App
 * @param {Object} data
 * @name Export:app
 */
function App(action, data) {
    console.log("emits", data);
    socket.emit("App", action, data);
}

socket.addEventListener("message", ({ data }) => {
    const response = JSON.parse(data);
    switch (response.module) {
        case "App":
            app(data);
            break;
        case "System":
            system(data);
            break;
        case "User":
            client(data);
            break;
        case "Auth":
            auth(data);
            break;
        case "Test":
            alert("test");
    }
});
cookie();
// // console.log("system:", system.toString())
// /**
//  * @listens System
//  * @callback System:handle
//  * @name Server:System
//  * @see Client:System
//  */
// socket.on("System", system)
// /**
//  * @listens Auth
//  * @callback Auth:handle
//  * @name Server:Auth
//  * @see Client:Auth
//  */
// socket.on("Auth",   auth)
// /**
//  * @listens Client
//  * @callback Client:handle
//  */
// socket.on("Client", client)
// /**
//  * @listens App
//  * @callback App:handle
//  * @name Server:App
//  * @see Client:App
//  */
// socket.on("App",    app)
/**
 * @listens disconnect
 * @callback Error:errorDialog
 */
socket.addEventListener("disconnect", () => {
    const error = new DialogBox(
        "Connection lost.",
        "Connection to the server has been lost.\nTry again?",
        4,
        [{
            text: "Retry",
            call: () => {
                console.log("retry");
            },
            main: true,
        }, {
            text: "Abort",
            call: () => {
                console.log("abort");
            },
            main: false,
        }],
        document.body,
        false,
    );
});
//test
export { App, Auth, Client, System };
