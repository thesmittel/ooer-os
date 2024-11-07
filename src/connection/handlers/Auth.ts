import { SocketRequest } from "../../types.ts"

export function handle(socket : WebSocket, data : SocketRequest) {
    switch(data.action) {
        case "login": {
            handleLogin(socket, data.data)
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
}