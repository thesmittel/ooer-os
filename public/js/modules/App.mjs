/**
 * Served to client on page load. Handles app related tasks that are not system critical.
 * @file App.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:App
 * @see <a href="./client.Client_App.html">Module</a>
 */
/**
 * Served to client on page load. Handles app related tasks that are not system critical.
 * @file App.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:App
 * @see <a href="./client.Client_App.html">Module</a>
 * @namespace ClientCode
 */
/**
 * @module App
 * @memberof client
 * @description App.mjs handles application requests, manages apps, their instances and windows, creates windows as well as managing the task bar.
 * @name Client:App
 * @author Smittel
 */

import { App as emit } from "./Connect.mjs"
import { create, getElement, getParentWindow, randomId } from "./Util.mjs";
import { startResize, endResize } from "../Handlers.mjs";
import { dragElement } from "./Dragging.mjs";
import { loseFocus } from "../Handlers.mjs";

/**
 * Receives data from the server directed at this module via the Connect module, serves as the connection between the two.
 * @method handle
 * @name Export:handle
 * @param {Object} data 
 * 
 */
function handle(data) {
    switch (data.response) {
        case "start_app":
            console.log(data)
            new App(data.data.id, data.data, data.data.permissions)
            break
        case "start_sysapp":
            new App(data.data.id, data.data, 2)
            break
        case "appdata":
            const { id } = data;
            appListeners[id](data.data);
            break;
    }
}
/**
 * Holds an applications full identifier and their server data event callback as key-value pairs 
 * @member appListeners
 * @name Internal:appListeners
 * @type Object
 * @todo Implement method for passing requested information to apps
 */
const appListeners = {}
/**
 * Allows system apps to register a callback function for server communication. 
 * @param {String} id App-Instance-Window ID
 * @param {Function} func Callback
 * @method registerListener
 * @name Export:registerListener
 */
function registerListener(id, func) {
    appListeners[id] = func;
}

/**
 * Holds instances of apps identified by their application ID and instance ID for unique identification
 * @member appInstances
 * @name Internal:appInstances
 * @type Object
 */
let appInstances = {}

/**
 * Counts all windows (DOM-Elements) of all app instances, more of a Util function but wont work there.
 * @method getNumberOfWindows
 * @name Export:getNumberOfWindows
 * @returns {Number} Number of windows
 */
function getNumberOfWindows() {
    if (appInstances == {}) return 0;
    let n = 0;
    for (let a in appInstances) {
        n += appInstances[a].elements.length;
    }
    return n;
}

/**
 * Grabs all windows (DOM-Elements) that belong to app instances, returns them sorted by draw order
 * @method makeWindowsArray
 * @name Internal:makeWindowsArray
 * @returns {Array} Array of DOM elements
 */
function makeWindowsArray() {
    if (appInstances == {}) return 0;
    let n = [];
    for (let a in appInstances) {
        n.push(...appInstances[a].elements.map(a => a.windowObject));
    }
    n.sort((a,b) => a.style["z-index"] - b.style["z-index"])
    return n;
}

/**
 * If a button in the taskbar is clicked, this will change the draw order of windows, bringing the window belonging to the button that was clicked to the front, unless it already is in front, then it gets minimised
 * @param {Event} e Event passthrough
 * @param {(Number|String)} windowid 12-digit number used to identify Instance Window
 * @param {(Number|String)} instanceid 12-digit number used to identify App Instance
 * @param {(Number|String)} appid 12-digit number used to identify App
 * @method taskbarIconClick
 * @name Internal:taskbarIconClick
 */
function taskbarIconClick(e, windowid, instanceid, appid) {
    const w = getElement(`window-${appid}-${instanceid}-${windowid}`)
    if (w.dataset.minimised == "false") {
        if (w.dataset.active == "true") {
            w.dataset.minimised = "true"
        } else {

            activeWindowChangeTarget(w)
        }
    } else {
        w.style.transition = "all 0.05s"
        setTimeout(() => { w.style.transition = null }, 50)
        activeWindowChangeTarget(w)
        w.dataset.minimised = "false"
    }
}

/**
 * Updates the taskbar when the active window is changed, highlighting the new active window's task bar icon
 * @param {(String|Number)} app 12 digit number used for unique identification
 * @param {(String|Number)} instance 12 digit number used for unique identification
 * @param {(String|Number)} window 12 digit number used for unique identification
 * @method updateTaskbar
 * @name Internal:updateTaskbar
 */
function updateTaskbar(app, instance, window) {
    for (let a in appInstances) {
        for (let w in appInstances[a].elements) {
            appInstances[a].elements[w].taskbaricon.dataset.active = "false";
        }
    }
    document.querySelector(`taskbar-button[data-appid="${app}"][data-instanceid="${instance}"][data-windowid="${window}"]`).dataset.active = true;
}

/**
 * Sets a window as the new active window, changing the draworder bringing the active window to the front while preserving the order of the other windows.
 * @param { HTMLElement } el The new active window.
 * @method activeWindowChangeTarget
 * @name Internal:activeWindowChangeTarget
 */
function activeWindowChangeTarget(el) {
    // Grabs list of all windows attached to any app instance
    let winArr = makeWindowsArray();
    // Removes the new active element
    winArr = winArr.filter(a => a.id != el.id);
    // pushes the new active to end of array
    winArr.push(el)
    for (let i in winArr) {
        winArr[i].style["z-index"] = i
        winArr[i].dataset.active = false;
    }
    el.dataset.active = true;
    updateTaskbar(el.dataset.appid, el.dataset.instanceid, el.dataset.windowid)
}

/**
 * Handles the click event when focussing a window. Passes the target window to Internal:activeWindowChangeTarget
 * @see Internal:activeWindowChangeTarget
 * @param { MouseEvent } event 
 * @listens MouseEvent
 * @method activeWindowChange
 * @name Internal:activeWindowChange
 */
function activeWindowChange(event) {
    loseFocus(event)
    event.stopPropagation();
    let newActive = getParentWindow(event.target)
    activeWindowChangeTarget(newActive);
}

/**
 * Maximises a window, storing the old position and dimensions in an attribute, so the previous configuration can be restored.
 * Does not need to call getParentWindow
 * @method maximiseWindow
 * @name Export:maximiseWindow
 * @param { HTMLDivElement } t A window element or element of the window's sub-tree
 * @todo Remove duplicate code by calling Internal:getParentWindow() instead
 */
function maximiseWindow(t) {
    let target = t;
    while (!target.id.match(/^window-\d{12}-\d{12}-\d{12}$/g)) {
        target = target.parentNode;
    }

    [target.dataset.oldTop, target.style.top] = [target.style.top, target.dataset.oldTop];
    [target.dataset.oldLeft, target.style.left] = [target.style.left, target.dataset.oldLeft];
    [target.dataset.oldHeight, target.style.height] = [target.style.height, target.dataset.oldHeight];
    [target.dataset.oldWidth, target.style.width] = [target.style.width, target.dataset.oldWidth];

    target.dataset.maximised = target.dataset.maximised == "false"

    document.getElementById("snapping-prev")
}






/**
 * @class Internal:App
 * @classdesc Constructs and manages windows for an app instance
 * @member App
 * @name Internal:App
 * @see <a href="./client.Client_App-App.html">Internal:App</a>
 * @todo Figure out how to document stuff inside these classes :/
 */
class App {
    #instance_id; // used for server responses to identify app instances - Random, "local"
    #app_id; // used to identify the app itself - determined by server
    // Both ids are needed to identify an app instance
    elements = []; // If an app uses multiple windows or applets, they are held here
    #version;
    #author;
    #name;
    #type;
    #icon;
    #about;
    #privilege;

    /**
     * Receives app config data from the server, initialises app instance, creates window
     * @constructor
     * @param { String } app_id App ID
     * @param { Object } data Server-provided application data
     * @param { Boolean } sys is system application?
     */
    constructor(app_id, data, sys) {
        this.#instance_id = randomId(12)
        this.#app_id = (sys === 2)?"000000000000":app_id.toString().padStart(12, "0");
        this.#author = data.config.author;
        this.#name = data.config.name;
        this.#type = data.config.type;
        this.#version = data.config.version;
        this.#about = data.about;
        this.#icon = data.icon;
        this.#privilege = sys
        appInstances[this.#instance_id] = this

        if (this.#type == "windowed") {
            for (let w of data.config.windows) {
                this.addWindow(w, sys)
            }
        }

        // this.addWindow({config: {}, "window_title": "test", content: {}, script: ""})

    }

    /**
     * Responsible for creating an instance of class window and saving it in the App instance
     * @param { Object } data Received from server, contains code, style, markup and miscellaneous config data
     * @param { Boolean } sys Determines level of access, true means it has access to the Client modules
     * @method addWindow
     * @public
     * @name Internal:App~addWindow
     */
    addWindow(data, sys) {
        const w = new Window(this.#instance_id, this.#app_id, data, this.#icon, sys)
        this.elements.push(w)
        w.show()

    }

    removeWindow(id) {
        this.elements = this.elements.filter(a => a.windowId != id)
    }

}

/**
 * @class Internal:Window
 * @classdesc Holds the data for a window, creates the relevant DOM Elements and appends to DOM
 * @member Window
 * @name Internal:Window
 * @see <a href="./client.Client_App-Window.html">Internal:App</a>
 * @todo Figure out how to document stuff inside these classes :/
 */
class Window {
    windowId;
    windowObject;
    #windowBody;
    #instance_id;
    #app_id;
    #script;
    #style;
    taskbaricon;
    #privilege;
    close(event) {
        const parent = getParentWindow(event.target);
        appInstances[parent.dataset.instanceid].removeWindow(parent.dataset.windowid)
        const appid = parent.dataset.appid;
        const instanceid = parent.dataset.instanceid;
        const windowid = parent.dataset.windowid;
        document.querySelector(`taskbar-button[data-appid="${appid}"][data-instanceid="${instanceid}"][data-windowid="${windowid}"]`).remove()
        parent.remove();
    }
    /**
     * 
     * @param { (String|Number) } instance_id 12 Digit identificator
     * @param { (String|Number) } app_id 12 Digit identificator
     * @param { Object } data Window confic provided by server
     * @param { String } icon URL to icon, provided by server 
     * @param { Boolean } sys Determines access level of window scripts
     */
    constructor(instance_id, app_id, data, icon, sys) {
        this.#instance_id = instance_id;
        this.#app_id = app_id;
        this.windowId = randomId(12)
        this.#privilege = sys || false;


        const closebutton = create({
            tagname: "a",
            id: "windowcontrolbutton",
            dataset: { action: "cls" },
            innerHTML: '<i id="windowcontrollbuttonicon" class="fa-solid fa-xmark"></i>',
            eventListener: {
                click: this.close,
                mousedown: (e) => { e.stopPropagation() }
            }
        })

        const minimiseButton = create({
            tagname: "a",
            id: "windowcontrolbutton",
            dataset: { action: "min" },
            innerHTML: '<i class="fa-solid fa-window-minimize fa-xs"></i>',
            eventListener: {
                click: (e) => {
                    getParentWindow(e.target).dataset.minimised = "true"
                },
                mousedown: (e) => { e.stopPropagation() }
            }
        })

        const restoreButton = create({
            tagname: "a",
            id: "windowcontrolbutton",
            dataset: {
                action: "max",
            },
            eventListener: {
                click: (e) => {
                    e.stopPropagation();
                    let replace = e.target;
                    let target = e.target.parentNode;
                    const parentWindow = getParentWindow(target);
                    parentWindow.style.transition = "all 0.05s"
                    setTimeout(() => { parentWindow.style.transition = null }, 50)


                    if (e.target.tagName == "I") {
                        target = target.parentNode
                        replace = replace.parentNode
                    }

                    maximiseWindow(parentWindow)
                    target.replaceChild(maximiseButton, replace)
                },
                mousedown: (e) => { e.stopPropagation() }
            },
            innerHTML: '<i class="fa-regular fa-window-restore"></i>'
        })

        const maximiseButton = create({
            tagname: "a",
            id: "windowcontrolbutton",
            dataset: {
                action: "res"
            },
            eventListener: {
                click: (e) => {
                    e.stopPropagation();
                    let replace = e.target;
                    let target = e.target.parentNode;
                    const parentWindow = getParentWindow(target);
                    parentWindow.style.transition = "all 0.05s"
                    setTimeout(() => { parentWindow.style.transition = null }, 50)


                    if (e.target.tagName == "I") {
                        target = target.parentNode
                        replace = replace.parentNode
                    }

                    maximiseWindow(parentWindow)
                    target.replaceChild(restoreButton, replace)
                },
                mousedown: (e) => { e.stopPropagation() }
            },
            innerHTML: '<i class="fa-regular fa-window-maximize fa-xs"></i>'
        })

        this.#style = create({
            tagname: "style",
            innerHTML: `div#window-${this.#app_id}-${this.#instance_id}-${this.windowId} > .window-body {${data.css}}`
        })

        this.#windowBody = create({
            tagname: "div",
            classList: ["window-body"],
            id: `window-${this.#app_id}-${this.#instance_id}-${this.windowId}.body`,
            innerHTML: data.html
        })

        const w = create({
            tagname: "div",
            classList: ["window"],
            id: `window-${this.#app_id}-${this.#instance_id}-${this.windowId}`,
            style: {
                width: ((data.defaultWidth) || (window.innerWidth * 0.7)) + "px",
                height: ((data.defaultHeight) || (window.innerHeight * 0.7)) + "px",
                "min-width": (data.minWidth || 240) + "px",
                "min-height": (data.minHeight || 240) + "px",
                "z-index": getNumberOfWindows(),
                top: "12px",
                left: "12px"
            },
            eventListener: { mousedown: activeWindowChange },
            dataset: {
                minimised: "false",
                id: this.#app_id,
                instanceid: this.#instance_id,
                windowid: this.windowId,
                appid: this.#app_id,
                active: "false",
                oldTop: "0px",
                oldLeft: "0px",
                oldWidth: "100%",
                oldHeight: "100%",
                maximised: "false",
                minHeight: (data.minHeight || 70),
                minWidth: (data.minWidth || 240)
            },
            childElements: [
                {
                    tagname: "div",
                    id: `window-${this.#app_id}-${this.#instance_id}-${this.windowId}-header`,
                    classList: ["window-header"],
                    childElements: [
                        {
                            tagname: "div",
                            id: `window-${this.#app_id}-${this.#instance_id}-${this.windowId}-header-icon`,
                            classList: ["window-icon"],
                            childElements: [
                                { tagname: "img", src: icon }
                            ]
                        },
                        {
                            tagname: "div",
                            id: `window-${this.#app_id}-${this.#instance_id}-${this.windowId}-header-title`,
                            innerText: data.title,
                            classList: ["window-title"]
                        },
                        {
                            tagname: "div",
                            id: `window-${this.#app_id}-${this.#instance_id}-${this.windowId}-header-controls`,
                            classList: ["window-controls"],
                            childElements: [
                                minimiseButton,
                                maximiseButton,
                                closebutton
                            ]
                        }
                    ]
                }, this.#style, this.#windowBody, {
                    tagname: "div",
                    classList: ["resize", "left"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    },
                }, {
                    tagname: "div",
                    classList: ["resize", "right"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    }
                }, {
                    tagname: "div",
                    classList: ["resize", "top"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    }
                }, {
                    tagname: "div",
                    classList: ["resize", "bottom"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    }
                }, {
                    tagname: "div",
                    classList: ["resize", "bottomleft"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    }
                }, {
                    tagname: "div",
                    classList: ["resize", "bottomright"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    }
                }, {
                    tagname: "div",
                    classList: ["resize", "topleft"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    }
                }, {
                    tagname: "div",
                    classList: ["resize", "topright"],
                    eventListener: {
                        mousedown: startResize,
                        mouseup: endResize
                    }
                }
            ]
        });

        this.windowObject = w;
        if (data.js != undefined && data.js != "") {
            this.#script = this.#addScript(data.js, this.windowObject, this.#app_id, this.#instance_id, this.windowId, this.#windowBody)
        }

        if (data.draggable == true || data.draggable === undefined) {
            dragElement(this.windowObject)
        }



        /*
        TO DO: change task bar icon creation to allow for grouping of icons that belong to the same application instance
        */
        this.taskbaricon = create({
            tagname: "taskbar-button",
            style: `background-image: url(${icon}); background-size: contain;`,
            dataset: {
                windowid: this.windowId,
                instanceid: this.#instance_id,
                appid: this.#app_id,
                active: "true"
            },
            eventListener: { 
                click: (e) => { taskbarIconClick(e, this.windowId, this.#instance_id, this.#app_id) },
                mouseover: taskbarSymbolAddWindowPreview,
                mouseout: taskbarSymbolDeleteWindowPreview
            }
        })

        document.querySelector("task-bar").append(this.taskbaricon)
    }

    setDrawOrder(n) {
        this.windowObject.style["z-index"] = n
    }

    show() {
        document.body.append(this.windowObject)
        activeWindowChangeTarget(this.windowObject)
    }

    #addScript(js, windowObject, appId, instanceId, windowId, windowbody) {
        const script = document.createElement("script");
        // script.id = "scr" + windowObject.id ;
        const id = `id${appId}${instanceId}${windowId}`;

        /* Should work bc its in a module:
            i want a list of whitelisted third party apps that is allowed
            higher privileges than regular apps.
            they could for example more freely modify their own windows
            (but still not access anything outside it), for example overwriting
            button functionality similar to how notepad and settings does it
            (settings isnt an application but...)
        */
       const scripttemplate = [`
       const ${id} = () => {
       const setInterval = () => {throw new Error("Intervals are forbidden")};`,
            `const getParent = (e, n = 1) => {
                if (e == undefined) {
                    throw new ValueError("element is undefined")
                }
                for (let i = 0; i < n; i++) {
                    try {
                        if (e.parentNode == document.getElementById("${windowbody.id}")) return e;
                        e = e.parentNode;
                    } catch (err) {
                    }
                }
                return e;
            };`,`

        }; ${id}();`]

        script.type = "text/javascript";

        /* TO DO:
            Theres a potential "exploit" with spawned webworkers with foreign scripts.
            Test, if possible, if so, patch
        */
       switch(this.#privilege) {
        case 0:  // fallthrough
        default: // Default permissions: only access to content of windowbody
            script.innerHTML = `
                ${scripttemplate[0]}
                const socket = {}
                const document = {
                    getElementById: (str) => {
                        return globalGetElementById("${windowbody.id}").querySelector("#" + str)
                    },
                    create: (str) => {
                        return globalCreate(str)
                    }
                };
                const body = globalGetElementById("${windowbody.id}")
                const window = {};
                const globalThis = {};self = {};frames = {}

                ${scripttemplate[1]}
                ${js.replace(/(previous(Element)?Sibling)|(parent(Element|Node)|ownerDocument)/gi)}
                ${scripttemplate[2]}`;

            break;
        case 1: // Elevated permissions: access to entire window of app
            script.innerHTML = `
                ${scripttemplate[0]}
                const socket = {}
                const document = {
                    getElementById: (str) => {
                        return globalGetElementById("${windowObject.id}").querySelector("#" + str)
                    },
                    create: (str) => {
                        return globalCreate(str)
                    }
                };
                const body = globalGetElementById("${windowbody.id}")
                const window = globalGetElementById("${windowObject.id}");
                const globalThis = {};self = {};frames = {}

                ${scripttemplate[1]}
                ${js.replace(/(previous(Element)?Sibling)|(parent(Element|Node)|ownerDocument)/gi)}
                ${scripttemplate[2]}`;
            break;
        case 2: // System permissions: all global objects are available. scripts are treated as modules.
            const imports = js.match(/(?<="<import>"\r?\n)[\w\W]*?(?=\r?\n+"<\/import>")/g)
            const code = js.replaceAll(/"<import>"[\w\W]+?"<\/import>"/g, "")
            console.log(imports)
            script.innerHTML = `${(imports||[]).join("\n")};\nconst body = document.getElementById("${windowbody.id}");\n${code}`
            script.type = "module"
            break;
       }

        script.listen = () => { }
        windowObject.append(script)
        this.script = script;
        return script;
    }

}

// change this to use data tags
/**
 * Is mouse on the taskbar window preview?
 * @type Boolean
 * @name Internal:mouseOnPreview
 */
let mouseOnPreview = false;
let onButton = false;

/**
 * Adds a small preview to the taskbar icon on hover by creating a deep copy of the window at the time of the hover event, then scaling it down via CSS scale to preserve aspect ratio, while also retaining the layout of the window
 * The HTML spec sadly lacks widespread support for <code>&lt;element&gt;</code>, so a deep copy has to be created. 
 * It is not a live preview, doing so would mean a massive performance hit.
 * @param {MouseEvent} mouseover
 * @method taskbarSymbolAddWindowPreview
 * @name Internal:taskbarSymbolAddWindowPreview
 * @todo Change dimensions of minimised window after sliding off-screen and finishing the animation so that the preview has the correct dimensions
 * @todo Aero-like effect where other windows get put in a glass-like state when hovering over a taskbar icon to emphasise what window is being selected
 * @todo Fix bug, where additional previews are laid on top of each other when moving mouse back from the small preview to the taskbar button
 */
function taskbarSymbolAddWindowPreview({target}) {
    // if preview already present dont show
    console.log("new?", target.dataset.previewactive)
    
    if (target.dataset.previewactive == "true") {
        console.log("already there")
        setTimeout(() => {
            target.dataset.previewactive = true;
        }, 1);
        return
    }
    
    target.dataset.previewactive = true;
    // get id of window
    const parentid = `window-${target.dataset.appid}-${target.dataset.instanceid}-${target.dataset.windowid}`;
    // get parent window
    const windowObject = document.getElementById(parentid)
    // get windowbody
    const windowbody = document.getElementById(`${parentid}.body`);
    // grabbing the stylesheet (raw)
    const style = windowObject.querySelector("style")
                            .innerHTML
                            .replace(parentid, `taskbar-${parentid}-preview > div `)
    // grab window title
    const title = document.getElementById(`${parentid}-header-title`).innerHTML
    // make deep copy of windowbody
    let clone = windowbody.cloneNode(true)
    // set height of windowbody copy:
    let {height, width} = getComputedStyle(windowbody)
    clone.style.position = "relative"
    clone.style.height = height;
    clone.style.width  = width;

    height = parseInt(height);
    width = parseInt(width)
    const xScale = 200 / width; // this should probably not be hardcoded
    const yScale = 120 / height;
    clone.id = ""
    // the smaller value should be the scaling factor
    const scalingFactor = Math.min(xScale, yScale);
    // make div with class preview and child element being the copy AND the cover, see below
    let preview = create({
        tagname: "div",
        classList: ["preview"],
        id: `taskbar-${parentid}-preview`,
        style: `height: ${height * scalingFactor}px !important; width: ${width * scalingFactor}px !important`,
        childElements: [
            {
                tagname: "div",
                style: `scale: ${scalingFactor}; transform-origin: top left; pointer-events: none;`,
                childElements: [clone]
            }
        ],
        eventListener: {
            mouseover: previewMouseIn,
            mouseout: previewMouseOut
        },
        dataset: {
            title: title
        }
    })
    const newstyle = create({
        tagname: "style",
        innerHTML: style
    })
    // append to symbol
    target.append(preview, newstyle)
    // with timeout of 1ms, add "active" class, has to have a timeout because otherwise, the active class is already present for some reason, meaning the animation doesnt work
    setTimeout(() => { preview.classList.add("active")}, 1);
}

/**
 * Changes mouseOnPreview state to ensure that the preview stays visible, when hovering over the preview instead of the button
 * @param { MouseEvent } e 
 * @method previewMouseIn
 * @name Internal:previewMouseIn
 */
function previewMouseIn(e) {
    e.stopPropagation();
    e.target.parentNode.dataset.previewactive = true;
    mouseOnPreview = true
}

/**
 * Change mouseOnPreview state and delete preview when no longer hovering over button or preview
 * @param { MouseEvent } e 
 * @method previewMouseOut
 * @name Internal:previewMouseOut
 */
function previewMouseOut(e) {
    e.stopPropagation();
    e.target.parentNode.dataset.previewactive = false;
    mouseOnPreview = false;
    taskbarSymbolDeleteWindowPreview({target: e.target.parentNode})
}
// TO DO: change minimising animation to end back on normal scale 
/**
 * After a brief delay, delete the preview if the mouseOnPreview state is false.
 * @param { Event } e
 * @method taskbarSymbolDeleteWindowPreview
 * @name Internal:taskbarSymbolDeleteWindowPreview
 * @todo Fix bug that creates new preview but doesnt delete the old one when moving mouse back
 */
function taskbarSymbolDeleteWindowPreview({target}) {

    target.dataset.previewactive = false;
    setTimeout(() => {
        if (target.dataset.previewactive != "true") {
            if (target.childNodes.length) {
                target.childNodes.forEach(a => {
                    a.classList.remove("active");
                    setTimeout(() => {
                        a.remove()
                    }, 100);
                })
            }
        }
    }, 100);
}
export { handle, maximiseWindow, getNumberOfWindows, registerListener }