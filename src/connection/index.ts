import * as Types from "../types.ts";
import * as Crypto from "https://deno.land/x/crypto_random_string@1.1.0/mod.ts";
import { generateSalt, grabUserData, randomId, tokenGen } from "../util.ts";
import { SocketManager } from "./SocketManager.ts";
import { setupAuthSocketHooks } from "./handlers/Auth.ts";
import { setupUserSocketHooks } from "./handlers/User.ts";

console.log(randomId(12));
// const salt = ("9giG6InqiSHVVMiqzxFsBfZsaiCIEeclND9iALA2RKWtgzYdbHdPY7Cog7pjhsk/L4h/esO3jNL7qrbMxUdaaQ==").split("")
// const pw = "testIngPassword";
// let newPW : any= pw;
// let reversePass = true;
// while(newPW.length < salt.length) {
//     if(reversePass) {
//         newPW += [...pw].reverse().join("")
//     } else {
//         newPW += pw;
//     }
// }
// newPW = newPW.slice(0, salt.length).split("")

// let weave = ""
// for (let i = 0; i < salt.length; i++) {
//     weave += (salt[i] + newPW[i])
// }
// let wp = weave.split("").map((a:string) => a.charCodeAt(0))
// let part1 : any = weave.slice(0, salt.length)
// let part2 : any = weave.slice(salt.length)
// part1 = part1.split("").map((a : string) => a.charCodeAt(0))
// part2 = part2.split("").map((a : string) => a.charCodeAt(0)).reverse()
// let first = part1;
// for (let i in first) {
//     first[i] ^= part2
// }
// let t  = new TextDecoder()
// console.log(t.decode(new Uint8Array(first)))
// const rounds = 10
// for (let j = 0; j < rounds; j++) {
//     for (let i = 0; i < first.length - 1; i++) {
//         first[i] ^= (first[(i + 1) % first.length] >> 4)
//         // first[i] ^= (wp[(i + 1) % first.length] >> 4)
//     }
//     // weave in "weave"
//     // maybe even add a server key
//     console.log(t.decode(new Uint8Array(first)))
// }

// console.log(t.decode(new Uint8Array(first)))
// // console.log(first)
// // console.log("salt",salt)

export class Connection {
  #socket: SocketManager;

  constructor(socket: SocketManager) {
    this.#socket = socket;
  }

  get socket(): SocketManager {
    return this.#socket;
  }

  set socket(socket: SocketManager) {
    this.#socket = socket;
  }
}

export class UnassignedConnection extends Connection {
  constructor(socket: SocketManager) {
    super(socket);
    // add only listeners relevant for log in and signup
    setupAuthSocketHooks(socket);
  }

  upgradeConnection(userid: string) {
    return new AssignedConnection(this.socket, userid);
  }
}

export class AssignedConnection extends Connection {
  #user?: Types.User;
  #token?: Types.Token;
  constructor(socket: SocketManager, userid: string) {
    super(socket);
    this.#user = grabUserData(userid);
    if (this.#user === undefined) throw new Error("No user found: " + userid);
    this.#token = {
      id: userid,
      token: tokenGen(),
      expires: (Date.now() + 1_800_000), // 30 minutes
    };
    // add all other listeners
    setupUserSocketHooks(socket);
  }

  set tokenExpiry(value: number) {
    if (this.#token) {
      this.#token.expires = value;
    }
  }

  get token(): Types.Token | undefined {
    return this.#token;
  }

  downgradeConnection() { // log out
    this.socket.deleteModule("User")
    this.socket.deleteModule("System")
    this.socket.deleteModule("App")
    // remove all listeners
    // turn back into unassigned connection
  }
}

export class DisabledConnection extends AssignedConnection {
  constructor(socket: SocketManager, userid: string) {
    super(socket, userid);
  }
}

export const sessions: Set<Connection> = new Set();

export let tokens: any = {};

// setInterval(()=> {
//     tokens = tokens.filter((a : Types.Token) => a.expires > Date.now())
// }, 1000) // Filter out expired tokens

export function addUnassignedSocket(socket: SocketManager) {
  sessions.add(new UnassignedConnection(socket));
}

export function refreshExpiry(assigned: AssignedConnection): void {
  const newExpiry: number = Date.now() + 1_800_000;
  assigned.tokenExpiry = newExpiry;
  const data = {
    "module": "auth",
    "action": "refreshTokenExpiry",
    "data": {
      "expiry": newExpiry,
      "token": assigned.token,
    },
  };
  assigned.socket.send(JSON.stringify(data));
}
