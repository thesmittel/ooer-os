/**
 * Server module: handles System requests, opens system apps
 * @file System.js
 * @author Smittel
 * @copyright 2024
 * @name Server:System
 * @see <a href="./client.Client_System.html">Server:System</a>
 * @requires Crypto
 * @requires fs
 * @todo Application caching
 */
/**
 * Server module: handles System requests, opens system apps
 * @file System.js
 * @author Smittel
 * @copyright 2024
 * @name Server:System
 * @see <a href="./server.Server_System.html">Server:System</a>
 * @namespace ServerCode
 * @requires Crypto
 * @requires fs
 * @todo Application caching
 */
/**
 * @module System
 * @memberof server
 * @description Server module: handles System requests, opens system apps
 * @name Server:System
 * @author Smittel
 * @requires Crypto
 * @requires fs
 * @todo Application caching
 */

import * as fs from "fs"
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('..', import.meta.url));

let appDB = JSON.parse(fs.readFileSync("./applications/custom/db.json"))

/**
 * Takes the id of a system application, grabs the files and sends them
 * @param { Socket } socket 
 * @param { {id: String} } data Object containing the application id
 * @emits Socket.emit:App
 * @method grabApplication
 * @name Export:grabApplication
 */
function grabApplication(socket, {id}) {
    // const id = data.id;
    const appDir = __dirname + "applications/system/" + id + "/"
    console.log("app", appDir)
    fs.readFile(appDir + "config.json" , (err, res) => {
        let config = JSON.parse(res)
        let count = 3 * config.windows.length;

        function cb(res, n, file) {
            // if (file == "js") {
            //     res = res.toString().replace(/ +/g, " ").replace(/(\t)/g, "").replace(/(\r?\n)/g, ";")
            // }
            config.windows[n][file] = res.toString();
            count--;
            
            if (!count) send()
        }
        for (let w = 0; w < config.windows.length; w++) {
            fs.readFile(appDir + config.windows[w].html, (err, res)=>{cb(res, w, "html")})
            fs.readFile(appDir + config.windows[w].js, (err, res)=>{cb(res, w, "js")})
            fs.readFile(appDir + config.windows[w].css, (err, res)=>{cb(res, w, "css")})
        }
        
        
        function send() {
            for (let w = 0; w < config.windows.length; w++) {
                config.windows[w].html = config.windows[w].html.toString().replace(/<\s*?script[\w\W]*?>[\w\W]*?<\/script>/gi, "")
            }
            // config.windows[0].js = `function getScriptWorker(foo) {return window.URL.createObjectURL(new Blob([foo], {type: "text/javascript"}))};function protectCode(code) {let worker  = new Worker(getScriptWorker(code))};protectCode(${config.windows[0].js.replace(/\r/g, "")})`;
            // 
            // config.windows[0].js = config.windows[0].js.replace(/([^;\n]*?((document)|(process)|(window))(\n*).*?(;|\n|$)|(eval\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\))|[^\n].*?parentNode.*?(;|$|\n))/gi, "")
            
            let appObj = {
                config: {
                    windows: config.windows,
                    type: config.type,
                    version: config.version,
                    name: config.name,
                    author: config.author,
                    resizable: config.resizable
                },
                icon: `/media/desktopicons?i=${id}`,
                id: id,
                permissions: 2
            }
            socket.emit("App", {response: "start_app", data: appObj})
        }
        
        
    })
}

export {grabApplication}