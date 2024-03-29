import * as Connect from "./modules/Connect.mjs"
import * as Handler from "./Handlers.mjs"


document.addEventListener("mousemove", Handler.windowResize);
document.addEventListener("mouseup", Handler.endResize)
// document.getElementById("login").addEventListener("click", Auth.login)


const clockobject = document.getElementById("clock-main");
// Clock
function clocktick() {
    let now = new Date(Date.now());
    clockobject.dataset.time = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit"
    })
    clockobject.dataset.date = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}
clocktick();
setInterval(clocktick, 1000)