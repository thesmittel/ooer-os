import {handle as auth, cookieLogin as cookie} from "./Auth.mjs"
import {handle as client} from "./Client.mjs"
import {handle as system} from "./System.mjs"
import {handle as app} from "./App.mjs"
const socket = io();

function System(data) {
    // console.log(data)
    socket.emit("System", data)
}

function Auth(data) {
    socket.emit("Auth", data)
}

function Client(data) {
    socket.emit("Client", data)
}

function App(data) {
    socket.emit("App", data)
}

cookie()
// console.log("system:", system.toString())
socket.on("System", system)
socket.on("Auth",   auth)
socket.on("Client", client)
socket.on("App",    app)

export {System, App, Auth, Client}