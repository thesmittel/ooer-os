import { SocketRequest, SocketResponse } from "../../types.ts";
import { AssignedConnection, Connection, sessions, tokens } from "../index.ts";
import { Auth } from "../send.ts";
import { SocketManager } from "../SocketManager.ts";
import * as Hash from "jsr:@stdext/crypto/hash"
import * as util from "jsr:@stdext/crypto/utils"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import {crypto} from  "@std/crypto"
import {walk} from "@std/fs/walk"


// export function handle(socket: WebSocket, data: SocketRequest) {
//   switch (data.action) {
//     case "login": {
//       handleLogin(socket, data.data);
//       break;
//     }
//     case "tokenLogin": {
//       handleLoginWithToken(socket, data.data);
//       break;
//     }
//     case "test": {
//       console.log("Test received");
//       Auth.return(socket, { "OMAN": "OMAN" });
//       break;
//     }
//   }
// }

type LoginInfo = {
  username: string;
  password: string;
};
function handleLogin(data: LoginInfo, socket: SocketManager) {

  const {passwords} = JSON.parse(Deno.readTextFileSync("./server/passworddb/passwords.json"))
  const userdata = JSON.parse(Deno.readTextFileSync("./server/users/userdata.json"))
                      .users
                      .filter((a : any) => (a.username == data.username))
  if (userdata.length > 1) {
    // Something went very wrong here
    throw new Error("Theres 2 people with the same username")
  }
  if (userdata.length < 1) {
    return {
      action: "error",
      data: {
        error: 2001,
        message: "Invalid Username or Password", // Will be granularised
      },
    };
  }
  const user = userdata[0]
  

  // grab salt and hashed password from DB
  // Hash provided password with salt
  // check
  bcrypt.compare(data.password, passwords[user.id])
        .then((passwordCorrect)=> {
          if (passwordCorrect) {
            numberOfFilesToServe().then(a => {
              user.expectedNumberOfFiles = a
              socket.Auth.send("confirmLogin", user)
            })
            
            return
            // return {
            //   action: "confirmLogin",
            //   data: {user},
            // };
          }
          socket.Auth.send("error", {
            error: 2001,
            message: "Invalid Username or Password", // Will be granularised
          })
        });
  return null
}

function processSignup(data: any) {
  /*
    username
    password
    passwordConfirm
    email?
  */
  if (data.password != data.confirmPassword) {
    return {
      action: "signup",
      data: {
        error: 2004,
        message: "Passwords do not match."
      }
    }
  }
  const userid = crypto.randomUUID()

  const salt = bcrypt.genSalt()
  .then((s) => {
     const hash = bcrypt.hash(data.password, s).then((h) => {
      // insert new data into database
      // in this case read text file, parse to object, add new user, save
      const passwords = JSON.parse(Deno.readTextFileSync("./server/passworddb/passwords.json"))
      if (passwords[userid]) {
        // uuid already exist
        throw new Error("UUID collision")
      }
      passwords.passwords[userid] = h
      Deno.writeTextFile("./server/passworddb/passwords.json", JSON.stringify(passwords))
      // do the same for user settings
      const userdata = JSON.parse(Deno.readTextFileSync("./server/users/userdata.json"))
      const usertemplate = JSON.parse(Deno.readTextFileSync("./server/users/userdata.json"))
      usertemplate.id = userid;
      usertemplate.email = data.email || null;
      userdata.users = usertemplate;
      Deno.writeTextFile("./server/users/userdata.json", JSON.stringify(userdata))
     })
  })
 
}

function handleLoginWithToken(data: any): SocketResponse {
  let valid: Connection[] = []; // maybe i had plans here, not sure
  // Get connection from object/database with given token registered
  if (tokens[data.token]) {
    // below is old code incompatible with socketmanager
    // Auth.confirmLogin(socket, {
    //   // Token, cookie data, desktop init data, maybe previous session
    // });
  }
  return {
    action: "tokenLogin",
    data: {
      error: 2011,
      message: "Invalid Token",
    },
  };
}

function handleRegister(data:any, socket: SocketManager) {
  
}

export function setupAuthSocketHooks(sm: SocketManager) {
  sm.registerModule("Auth");
  console.log("here")
  sm.Auth.listen("login", (data:any) => {return handleLogin(data, sm)});
  sm.Auth.listen("tokenLogin", handleLoginWithToken);
  sm.Auth.listen("register", (data:any) => {return handleRegister(data, sm)})
  sm.Auth.listen("test", (): SocketResponse => {
    return {
      data: {OMAN: ":c"}
    };
    sm.Auth.send("return", { OMAN: "omAN" });
  });

}

export async function numberOfFilesToServe() {
  let n = 0;
  for await (const walkEntry of walk(Deno.cwd() + "/client/desktop")) {
    const type = walkEntry.isSymlink
      ? "symlink"
      : walkEntry.isFile
      ? "file"
      : "directory";
    if (type == "file") {
      n++;
    }
  }
  
  return n;
}