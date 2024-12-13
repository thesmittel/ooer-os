import { SocketRequest } from "../../types.ts"
import { SocketManager } from "../SocketManager.ts";

export function handle(socket : WebSocket, data : SocketRequest) {

}

function grabDesktopSymbols(data: any) {
    // data needs to include user identification of sorts
}

function grabRegisteredApps(data:any) {
}

function grabUserSettings(data: any) {
}

export function setupUserSocketHooks(sm: SocketManager) {
    sm.registerModule("User")
    sm.User.listen("desktopsymbols", grabDesktopSymbols)
    sm.User.listen("getapps", grabRegisteredApps)
    return {
        module: "Auth",
        action: "test",
        data: {}
    }
}