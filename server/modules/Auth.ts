import { SessionList, Token, UserSession } from "../types.ts";
import * as Crypto from "https://deno.land/x/crypto_random_string@1.1.0/mod.ts";
import { addUser } from "../../server.ts";
import { Socket } from "socket.io";
import { response } from "../../node_modules/@types/express/index.d.ts";


const decoder : TextDecoder = new TextDecoder()
console.log(Crypto.cryptoRandomString({length: 10}))
const passwords = JSON.parse(decoder.decode(Deno.readFileSync("./server/passworddb/passwords.json"))).passwords;

let sessions : SessionList = {
    assigned: new Set<UserSession>(),
    unassigned: new Set()
}

let tokens : Token[] = []

const tokenInterval = setInterval(() => {
    tokens = tokens.filter(a => a.expires < Date.now())
}, 1000)

export function getNewUserId() : string {
    const randomBytes : string[] = Array.from(Crypto.cryptoRandomString({length: 10, type: "numeric"}))
    return randomBytes.map((a : string) => {return parseInt(a) % 10}).join("").padStart(12, "0");
}

function tokenGen() : string {
return Crypto.cryptoRandomString({length: 10, type: "base64"})
}

function saltGen() : string {
    return Crypto.cryptoRandomString({length: 10, type: "base64"})
}

function hashPassword(saltedPassword : string) : string {
    return ""
    //return Crypto.createHash("md5").update(saltedPassword).digest("hex");
}

type SignUpData = {
    username: string;
    email: string;
    password: string;
    passwordconfirm: string;
}
function signup(socket : Socket, {username, email, password, passwordconfirm} : SignUpData) : void {
    const salt :string = saltGen();
    const hashedPW : string = hashPassword(salt + password);
    let id : string = getNewUserId();
    while (passwords[id] != undefined) {
        id = getNewUserId();
    }
    passwords[id] = {password: hashedPW, salt: salt};
    const encoder : TextEncoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({passowrds: passwords}))
    Deno.writeFile("./passworddb/passwords.json", data);
    addUser(id, username, email);
    socket.emit("Auth", {response: "confirm-signup", data: {username: username, password: password}})
}

function login(socket : Socket, data :any, user: any) : void {
    if (user == undefined) {
        socket.emit("Auth", {
            error: {
                code: "A-0001",
                message: "Invalid username"
            }
        })
        return;
    }
    if (passwords[user.id].password != hashPassword(passwords[user.id].salt + data.password)) {
        socket.emit("Auth", {
            error: {
                code: "A-0002",
                message: "Invalid password"
            }
        })
        return;
    }
    loginconfirm(socket, data, user, false);
}

function loginwithcookie(socket:any, data:any, user:any) {
    let check = tokens.filter(a => (a.id == data.userid && a.token == data.oldToken));
    if (check == null) return;
    tokens = tokens.filter(a => a.id != data.userid);
    loginconfirm(socket, data, user, true);
}

function loginconfirm(socket: any, data : any, user : any, withcookie: boolean) {
    let currtime : number = Date.now();
    let expiretime : number = currtime + (30 * 60 * 1000);
    const token = tokenGen();
    sessions.unassigned.delete(socket);
    sessions.assigned.add({
        "user-id": user.id,
        "token": token,
        "cache": user,
        "socket": socket,
        "expires": expiretime
    })
    tokens.push({
        id: user.id,
        token: token,
        expires: expiretime
    })
    socket.emit("Auth", {
        response: withcookie ? "confirm-cookielogin" : "confirm-login",
        data: {
            "user-id": user.id,
            "token": token,
            "cache": user,
            "expires": expiretime
        }
    })

    for (let s in user.desktop_symbols) {
        const curr = user.desktop_symbols[s];
        let appconfig;
        if (curr.appid.match(/^\d{12}$/g)) {
            appconfig = JSON.parse(Deno.readTextFileSync(`./server/applications/custom/${curr.appid}/config.json`))
        }
    }
}