/**
 * @module main
 * @name Client:main
 * @description Starting point, initialiser for all other modules. Handles clockticks
 */
import { closeLogin } from "../desktop/connect/Auth.mjs";
// import * as Connect from "./modules/Connect.mjs"
// import * as Handler from "./modules/Handlers.mjs"
// import { create } from "./modules/Util.mjs"
// import { Panel } from "./components/ui.mjs"
// // import { Widget } from "./modules/desktop/desktop.mjs"
// import { ArgumentError, ValueError } from "./modules/system/Error.mjs"
// import * as Keyboard from "./modules/input/Keyboard.mjs"
// import { clock } from "./modules/util/clock.mjs"
// import { PasswordPrompt } from "./components/ui/passwordPrompt.mjs"
console.log("SERVED")


const bo = document.querySelector("div.blackout");
bo.style.opacity = 0;
bo.addEventListener("transitionend", () => {
    bo.remove()
})
const loadingAnim = Array.from(document.querySelector("div.blackout").childNodes).filter(a => a.dataset)
console.log(loadingAnim)
loadingAnim.forEach(a => {
    a.style.opacity = 0;
    a.addEventListener("transitionend", () => {
        a.remove()
    })
})
closeLogin()


// for some reason this works, but will be changed anyways
// Handler.openLogin({stopPropagation: ()=>{}})

// document.getElementById("login").addEventListener("click", Auth.login)


// const originalEventListener = EventTarget.prototype.addEventListener;



// EventTarget.prototype.addEventListener = function (type, listener, options) {
//     const newListener = function (event) {
//         // No matter where, no matter what, this will ALWAYS sanitise any user input
//         // Textboxes, textareas, input etc
//         const oldVal = event.target.value;
//         event.target.value = sanitise(event.target.value)
//         // contenteditable = true
//         const oldHTML = event.target.innerHTML
//         event.target.innerHTML = sanitise(event.target.innerHTML)
//         // Should probably disable timeouts and intervals since those would not be affected by any of this due to the reset
//         listener.call(this, event)

//         // Resetting the elements to their previous state to prevent any visual glitches.
//         event.target.value = unsanitise(event.target.value);
//         event.target.innerHTML = unsanitise(event.target.innerHTML);
//     }
//     originalEventListener.call(this, type, newListener, options);
// }


// HTMLElement.prototype.__defineGetter__('value', function() {
//     console.log("The 'value' property was read");
//     // Return the actual value of the 'value' property
//     return this.getAttribute('value');
// });


/**
 * Attempt at overriding value getter, didnt work
 */
Object.defineProperty(HTMLElement.prototype, "value", {
    enumerable: true,
    configurable: true,
    get: function() {
        console.log("test")
    }
})


const clockobject = document.getElementById("clock-main");
document.addEventListener("contextmenu", Handler.contextMenu)
// Clock
// function clocktick() {
//     let now = new Date(Date.now());
//     clockobject.dataset.time = now.toLocaleTimeString(undefined, {
//         hour: "2-digit",
//         minute: "2-digit"
//     }).replace(/[ap]m/gi, "")
//     clockobject.dataset.date = now.toLocaleDateString(undefined, {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric"
//     })
// }
// clocktick();

// setInterval(clocktick, 1000)
