import * as Types from "../types.ts";
import * as Crypto from "https://deno.land/x/crypto_random_string@1.1.0/mod.ts";

class Connection {
    #socket : WebSocket;

    constructor(socket : WebSocket) {
        this.#socket = socket;
    }

    get socket() : WebSocket {
        return this.#socket
    }

    set socket(s : WebSocket) {
        this.#socket = s;
    }
}

export class UnassignedConnection extends Connection {

    constructor(socket : WebSocket) {
        super(socket);
    }
}

export class AssignedConnection extends Connection {
    #user : (Types.User | null);
    #token : Types.Token
    constructor(socket : WebSocket, userid : string) {
        super(socket);
        this.#user = grabUserData(userid);
        if (this.#user == null) throw new Error("No user found: " + userid)
        this.#token = {
            id: userid,
            token: tokenGen(),
            expires: (Date.now() + 1_800_000) // 30 Minutes
        };
    }

    set tokenExpiry(value : number) {
        this.#token.expires = value;
    }
    get token() {
        return this.#token.token;
    }
}

export function refreshExpiry(assigned:AssignedConnection) : void {
    const newExpiry : number = Date.now() + 1_800_000;
    assigned.tokenExpiry = newExpiry;
    const data = {
        "module": "auth",
        "action": "refreshTokenExpiry",
        "data": {
            "expiry" : newExpiry,
            "token": assigned.token
        }
    }
    assigned.socket.send(JSON.stringify(data))
}

function grabUserData(id : string) : (Types.User | null) {
    const user : Types.User[] = JSON.parse(Deno.readTextFileSync("../../server/users/userdata.json")).users.filter((a : Types.User) => a.id == id)
    if (user.length != 1) return null;
    return user[0]
}

function tokenGen() : string {
    return Crypto.cryptoRandomString({length: 10, type: "base64"})
}