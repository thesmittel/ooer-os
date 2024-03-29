import * as Crypto from 'crypto'
import * as fs from "fs"
import { addUser } from '../server.js';

// this WILL be replaced 
let passwords = JSON.parse(fs.readFileSync("./passworddb/passwords.json").toString()).passwords
let sessions = {
    assigned: new Set(),
    unassigned: new Set()
};

let tokens = []

setInterval(() => {
    tokens = tokens.filter(a => a.expires < Date.now())
}, 1000)
/*
"id": {
    "token": token,
    "cache": loaduserdata,
    "socket": socket
}
*/

function getNewUserID() {
    return Crypto.randomBytes(12).map(a => a % 10).join("").padStart(12, "0")
}

function tokenGen() {
    const token = Crypto.randomBytes(128).toString('base64');
    return token;
}

function saltGen() {
    const salt = Crypto.randomBytes(64).toString("base64");
    return salt;
}

function hashPassword(saltedPassword) {
    return Crypto.createHash('md5').update(saltedPassword).digest('hex');
}

function signup(socket, {username, email, password, passwordconfirm}) {
    const salt = saltGen();
    const hashedPW = hashPassword(salt + password)
    let id = getNewUserID();
    while (passwords[id] != undefined) {
        id = getNewUserID;
    }
    passwords[id] = {password: hashedPW, salt: salt}
    fs.writeFile("./passworddb/passwords.json", JSON.stringify({passwords: passwords}), ()=> {})
    addUser(id, username, email)
    socket.emit("Auth", {response: "confirm-signup", data: {username: username, password: password}})
}

function login(socket, data, user) {
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
        return
    }
    loginconfirm(socket, data, user)
}

function loginwithcookie(socket, data, user) {
    
    let check = tokens.filter(a => (a.id == data.userid && a.token == data.oldToken))
    if (check == null) return;
    tokens = tokens.filter(a => a.id != data.userid)
    loginconfirm(socket, data, user)
}

function loginconfirm(socket, data, user) {
    let currTime = Date.now();
	let expiretime = currTime + (30 * 60 * 1000); // Cookies expire after 30 minutes.
    const token = tokenGen();
    sessions.unassigned.delete(socket)
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
        response: "confirm-login",
        data: {
            "user-id": user.id,
            "token": token,
            "cache": user,
            "expires": expiretime
        }
    })
    socket.emit("System", {res: "desktop-symbols", data: user["desktop_symbols"]})
    socket.emit("System", {res: "notification", data: {icon: "logo.png", title: "congratulations.", text: "Ya managed to log in. proud of ya, bozo"}})

}

function removeSocket(socket) {
    let wasUnassigned = sessions.unassigned.delete(socket);
    if (wasUnassigned) return;
    let tmp = Array.from(sessions.assigned);
    let obj = tmp.filter(a => a.socket == socket)[0]
    sessions.assigned.delete(obj)
}

function addUnassignedSocket(socket) {
    sessions.unassigned.add(socket)
}





function signupCheckUsernameAvailable(socket, users, data) {
    const user = users.filter(a => a.username.toLowerCase() == data.toLowerCase() )[0];
    if (user) {
        socket.emit("Auth", {
            error: {
                code: "A-0003",
                message: "Username taken"
            }
        })
    } else {
        socket.emit("Auth", {response: "confirm-usernameAvailable"})
    }
    return (user == null)
}

function signupCheckEmailRegistered(socket, users, data) {
    if (data == undefined || data == "") {
        socket.emit("Auth", {response: "confirm-emailAvailable"})
        return true
    };
    const user = users.filter(a => a.email == data)[0];
    if (user) {
        socket.emit("Auth", {
            error: {
                code: "A-0004",
                message: "Email address already registered"
            }
        })
    } else {
        socket.emit("Auth", {response: "confirm-emailAvailable"})
    }
    return (user == null && signupCheckValidEmail(socket, data))
}

function signupCheckPasswordMatch(socket, {password, passwordconfirm}) {
    if (password != passwordconfirm) {
        socket.emit("Auth", {error: {
            code: "A-0006",
            message: "Passwords don't match"
        }})
    }
    return (password == passwordconfirm)
}

function signupCheckPasswordRequirements(socket, {password}) {
    if (password == undefined || password == "") socket.emit("Auth", {error: {
        code: "A-0007",
        message: "Password required"
    }})
    console.log(password)
    const length = (password.length >= 8);
    const uppercase = password.match(/[A-Z]/g) != null;
    const lowercase = password.match(/[a-z]/g) != null;
    const numbers = password.match(/[0-9]/g) != null;
    const special = password.match(/[*.!@$%^&(){}\[\]:;<>,.?\/~_+\-=|\]§´`#'°]/g) != null;
    let metRequirements = 0;
    metRequirements += uppercase;
    metRequirements += lowercase;
    metRequirements += numbers;
    metRequirements += special;
    if (!length || (metRequirements < 3)) {
        socket.emit("Auth", {error: {
            code: "A-0005",
            message: "Password criteria not met"
        }})
    }
    return (length && (metRequirements >= 3))
}

function signupCheckValidEmail(socket, email) {
    if (email == "" || email == undefined) return true
    let extract = email.match(/[^\s.{2,}]{2,}@\S+\.\S{2,}/)
    if (extract == null) {
        socket.emit("Auth", {error: {
            code: "A-0008",
            message: "Invalid Email address"
        }})
        return false
    }
    extract = extract[0];
    if (extract.length != email.length) {
        socket.emit("Auth", {error: {
            code: "A-0008",
            message: "Invalid Email address"
        }})
        return false
    }
    socket.emit("Auth", {response: "confirm-legalemail"})
    return true
}

export {login, tokenGen, addUnassignedSocket, removeSocket, loginwithcookie, signup, signupCheckUsernameAvailable, signupCheckEmailRegistered, signupCheckPasswordMatch, signupCheckPasswordRequirements}