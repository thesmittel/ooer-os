import { System as emit, App } from "./Connect.mjs"
import { handlers } from "../Error.mjs";
import * as Util from "./Util.mjs";

let lastheartbeat = Date.now();

let registeredSysApps = []

function registerSysApp(fullId, func) {
    registerSysApp.push({id: fullId, handle: func})
}

function handle(data) {
    console.log("System", data)
    switch (data.res) {
        case "heartbeat":
            lastheartbeat = Date.now();
            break;
        case "notification":
            makeNotification(data.data);
            break;
        case "desktop-symbols":
            setupDesktopSymbols(data)
            break
        case "sysapp":

    }
}

function setupDesktopSymbols({ data }) {
    const container = document.getElementById("sysdsouter");

    for (let i = 0; i < data.length; i++) {
        const curr = Util.create({
            tagname: "desktop-symbol",
            style: `background-image: url(/media/desktopicons?i=${data[i].appid});
                filter: drop-shadow(0px 0px 5px #2228);
                top: ${data[i].position[1] * 72}px;
                left: ${data[i].position[0] * 96}px`,
            dataset: {
                appid: data[i].appid,
                name: data[i].text
            },
            eventListener: {
                click: () => {
                    if (data[i].appid.match(/^\d{12}$/g)) {
                        App({req: "fetch_app", data: { id: data[i].appid } })
                    } else {
                        emit({req: "fetch_app", data: { id: data[i].appid } })
                    }
                },
                mousedown: dragSymbol
            }
        })

        container.append(curr)
    }
}
// TODO: desktop symbol dragging
function dragSymbol (e) {
    const timer = setTimeout(() => {
        alert("dragging")
    }, 100);
    
    e.target.addEventListener("mouseup", () => {clearTimeout(timer)})
}

function makeNotification({ icon, title, text, app }) {
    const box = Util.create({
        tagname: "notification-box",
        dataset: { visible: "false" },
        childElements: [
            {
                tagname: "div",
                classList: ["notification-icon"],
                childElements: [
                    {
                        tagname: "img",
                        src: `/media/icons?i=${icon}`
                    }
                ]
            }, {
                tagname: "div",
                classList: ["notification-main"],
                childElements: [
                    {
                        tagname: "div",
                        classList: ["notification-title"],
                        innerText: title
                    }, {
                        tagname: "div",
                        classList: ["notification-text"],
                        innerText: text
                    }
                ]
            }
        ]
    })
    if (app) {
        box.style.cursor = "pointer"
        box.addEventListener(click, (e) => { console.log(app) })
    }
    document.body.append(box);
    setTimeout(() => {
        box.dataset.visible = "true"
        setTimeout(() => {
            box.dataset.visible = "false";
            setTimeout(() => {
                box.remove()
            }, 100);
        }, 4100);
    }, 1);

}

// setInterval(() => {
//     emit({req: "heartbeat"})
//     if (Date.now() - lastheartbeat > 10) handlers["S-0001"]({code: "S-0001", message: "Connection to server timed out"})
// }, 1000)

export { handle }