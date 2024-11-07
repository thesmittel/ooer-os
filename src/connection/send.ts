import type { Token } from "../types.ts";


function send(socket : WebSocket, module : string, action : string, data : object) {
    socket.send(JSON.stringify({
        module: module,
        action: action,
        data: data
    }))
}



export const Auth = {
    refreshExpiry: function(socket : WebSocket, expiry: number) {
        send(socket, "Auth", "refreshExpiry", {expiry: expiry})
    },
    refreshToken: function(socket : WebSocket, data: Token) {
        send(socket, "Auth", "refreshToken", data)
    },
    confirmLogin: function(socket : WebSocket, data : object) {
        send(socket, "Auth", "confirmLogin", data)
    }
}