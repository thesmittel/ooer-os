import handle from "./src/connection/receive.ts";
import { route } from "./src/route.ts";
import * as Types from "./src/types.ts";

let sessions : Types.SessionList = {
    assigned: new Set<Types.UserSession>(),
    unassigned: new Set()
}

async function main(_req: Request) : Promise<Response> {
    if (_req.headers.get("upgrade") == "websocket") {
        const {socket, response} = Deno.upgradeWebSocket(_req);
        socket.addEventListener("open" , () => {
            console.log("connected")
        })
    
        socket.addEventListener("message", (event) => {
            handle(socket, event.data)
            // if (event.data === "ping") {
            //     socket.send("pong")
            // }
            // if (event.data.module) {
            //     handle(socket, event.data)
            // }
        })
    
        socket.addEventListener("error", (error) => {
            console.log(socket, error)
            socket.close();
        })
        return response;
    }
    const res = await route(_req);

    if (res == undefined) return new Response(null, {status: 501})
    return res
    // console.log(_req.headers.get("accept"), _req.url)
    // if (_req.headers.get("accept").match(/text\/css/) && _req.url.match(/\.css$/)) {
    //     const req = _req.url.split("/")[4];
    //     console.log(req)
    //     const css = Deno.readTextFileSync("./client/public/css/" + req)
    //     return new Response(css, {
    //         headers: {
    //             "content-type": "text/css"
    //         }
    //     })
    // }

    // const html = Deno.readTextFileSync("./client/index.html");
    // return new Response(html, {
    //     "headers": {
    //         "content-type": "text/html"
    //     }
    // })

    // if (_req.headers.get("upgrade") != "websocket") {
    //     return new Response(null, {status: 501})
    // }

    
}


Deno.serve({ port: 8080 }, main);

// import express from "express"
// import * as srv from "@std/http"
// import * as http from "node:http"
// import {Server, Socket} from "socket.io"
// import * as types from "./server/types.ts"
// import * as url from 'node:url';
// import { __dirname } from "./server/modules/misc.ts"
// import * as ServerHandlers from "./server/modules/Handler.ts"
// import { getNewUserId } from "./server/modules/Auth.ts";
// // import * as Auth from "./server/modules/Auth.js"
// // import * as System from "./server/modules/System.js"
// // import * as App from "./server/modules/App.js"



// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);
// app.use(express.static(__dirname + '/client/public'));

// app.get("/", ServerHandlers.base)
// app.get('/media/images', ServerHandlers.imagesQuery)

// app.get('/media/icons', ServerHandlers.iconsQuery)

// app.get('/media/images/:img', ServerHandlers.images)

// app.get('/media/icons/:img', ServerHandlers.icons)

// app.get('/media/desktopicons/:app', ServerHandlers.desktopIcons)

// server.listen(8080, "localhost", () => {
//     console.log('listening on *:8080');
// });

// // let users : types.User[] = JSON.parse(fs.readFileSync("./server/users/userdata.json").toString()).users
// const decoder : TextDecoder = new TextDecoder();

// let users : types.User[] = JSON.parse(decoder.decode(Deno.readFileSync("./server/users/userdata.json"))).users

// export function addUser(id: string, username: string, email: string) {
//     console.log(id, username, email);
//     users.push({
//         id: id,
//         username: username,
//         nickname: null,
//         email: email,
//         banner: null,
//         avatar: null,
//         status: "online",
//         about: null
//     });
//     // fs.writeFile(
//     //     "./users/userdata.json",
//     //     JSON.stringify({ users: users }),
//     //     () => {},
//     // );
// }