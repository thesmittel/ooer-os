import * as express from "express"
import * as http from "http"
import * as fs from "fs"
import {Server} from "socket.io"
import * as url from 'url';
import * as Auth from "./modules/Auth.js"
import * as System from "./modules/System.js"
import * as App from "./modules/App.js"


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express.default();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

let users = JSON.parse(fs.readFileSync("./users/userdata.json").toString()).users


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/media/images', (req, res) => {
    res.sendFile(__dirname + "/media/images/" + req.query.i)
})

app.get('/media/icons', (req, res) => {
    res.sendFile(__dirname + "/media/icons/" + req.query.i)
})

app.get('/media/desktopicons', (req, res) => {
    if (req.query.i.match(/^\d{12}$/g)) {
        res.sendFile(__dirname + "/applications/custom/" + req.query.i + "/icon.png")
        return
    }
    res.sendFile(__dirname + "/applications/system/" + req.query.i + "/icon.png")
})

function authReq(socket, data) {
    let user;
    switch (data.req) {
        case "login":
            user = users.filter(a => a.username == data.data.username)[0];
            Auth.login(socket, data.data, user)
            break
        case "cookielogin":
            const cookie = data.data.split(";").map(a => a.split("="))
            const userid = cookie[0][1];
            const oldToken = cookie[1][1];
    
            const cookieuser = users.filter(a => a.id == userid)[0];
            if (cookieuser != null && cookieuser != undefined) Auth.loginwithcookie(socket, {id: userid, oldToken: oldToken}, cookieuser)
            break
        case "signupCheckUsernameAvailable": 
            Auth.signupCheckUsernameAvailable(socket, users, data.data)
            break
        case "signupCheckEmailRegistered":
            Auth.signupCheckEmailRegistered(socket, users, data.data)
            break
        case "signup":
            console.log("ORIG", data.data)
            const username = Auth.signupCheckUsernameAvailable(socket, users, data.data.username)
            const email = Auth.signupCheckEmailRegistered(socket, users, data.data.email)
            const pwmatch = Auth.signupCheckPasswordMatch(socket, data.data)
            const pwreq = Auth.signupCheckPasswordRequirements(socket, data.data)
            if (username && email && pwmatch && pwreq) {
                Auth.signup(socket, data.data)
            }
    }
}

function appReq(socket, data) {
    switch(data.req) {
        case "fetch_app":
            App.grabApplication(socket, data.data)
            break
    }
}

function clientReq(socket, data) {
    const req = data.name.split("\x00")
}

function systemReq(socket, data) {
    console.log(data)
    switch(data.req) {
        case "heartbeat":
            socket.emit("System", {res: "heartbeat"})
            break
        case "fetch_app":
            console.log("fetch app")
            System.grabApplication(socket, data.data)
            break
    }
}


io.on('connection', (socket) => {
    Auth.addUnassignedSocket(socket);
    socket.on("disconnect", ()=>{Auth.removeSocket(socket)})
	socket.on("Auth", (data) => {authReq(socket, data)})
    socket.on("Client", (data) => {clientReq(socket, data)})
    socket.on("System", (data) => {systemReq(socket, data)})
    socket.on("App", (data) => {appReq(socket, data)})
})

server.listen(8080, () => {
    console.log('listening on *:8080');
});



function addUser(id, username, email) {
    console.log(id, username, email)
    users.push({
        id: id,
        username: username,
        nickname: null,
        email: email,
        banner: null,
        avatar: null,
        status: "online",
        about: null
    })
    fs.writeFile("./users/userdata.json", JSON.stringify({users: users}), ()=>{})
}




export {addUser}