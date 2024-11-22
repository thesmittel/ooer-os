import { SocketRequest } from "../../types.ts"
import { AssignedConnection, Connection, sessions, tokens } from "../index.ts";
import { Auth } from "../send.ts";

export function handle(socket : WebSocket, data : SocketRequest) {
    switch(data.action) {
        case "login": {
            handleLogin(socket, data.data)
            break
        }
        case "tokenLogin": {
            handleLoginWithToken(socket, data.data)
            break;
        }
        case "test": {
            console.log("Test received")
            Auth.return(socket, {"OMAN":"OMAN"})
            break
        }
    }
}
type LoginInfo = {
    username: string,
    password: string
}
function handleLogin(socket: WebSocket, data: LoginInfo) {
    console.log("handle login:", data)
    // grab salt and hashed password from DB
    // Hash provided password with salt
    // check
    const passwordCorrect : boolean = false;
    if (passwordCorrect) {
        Auth.confirmLogin(socket, {
            // Token, cookie data, desktop init data, maybe previous session
        })
    }
}

function handleLoginWithToken(socket: WebSocket, data : any) {
    let valid : Connection[] = [] // maybe i had plans here, not sure
    // Get connection from object/database with given token registered
    if (tokens[data.token]) {
        Auth.confirmLogin(socket, {
            // Token, cookie data, desktop init data, maybe previous session
        })
    }
}