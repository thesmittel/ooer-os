import {handle as handleAuth} from "./handlers/Auth.ts"
import {handle as handleApp} from "./handlers/App.ts"
import {handle as handleUser} from "./handlers/User.ts"
import {handle as handleSystem} from "./handlers/System.ts"


export default function handle(socket: WebSocket, request : string) {
    const data = JSON.parse(request);
    switch (data.module) {
        case "Auth": {
            handleAuth(socket, data);
            break;
        }
        case "System": {
            handleSystem(socket, data);
            break;
        }
        case "User": {
            handleUser(socket, data);
            break
        }
        case "App": {
            handleApp(socket, data);
            break;
        }
    }
}