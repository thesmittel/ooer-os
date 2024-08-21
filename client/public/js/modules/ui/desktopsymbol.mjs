import { App, System } from "../Connect.mjs";
import { create } from "../Util.mjs";
import { ContextMenu } from "./contextmenu.mjs";


class DesktopSymbol {
    element;
    label;
    icon;
    appid;
    contextmenu;
    description;
    position;
    locked;
    constructor({ position, appid, text, icon, description, contextmenu, locked, label }) {
        if (!contextmenu) {
            contextmenu = []
        } else {
            contextmenu.push({type: "divider"})
        }
        
        // Errors
        if (!(contextmenu instanceof Array)) throw new ReferenceError("class DesktopSymbol: optional argument contextMenu must be an array.")
        if (!text) throw new ReferenceError("class DesktopSymbol: argument text must be non-empty string. Got: '" + text + "' (" + typeof label + ")");
        
        this.contextmenu = contextmenu
        this.icon = icon;
        if (!icon) this.icon = appid; // If user didnt customise icon, use assigned apps icon
        this.label = label || text;
        this.appid = appid
        this.position = position
        this.description = description
        this.element = create({
            tagname: "desktop-symbol",
            style: `background-image: url(/media/desktopicons?i=${this.icon});
                top: ${this.position[1] * 72}px;
                left: ${this.position[0] * 96}px`,
            dataset: {
                appid: this.appid,
                name: this.label
            },
            eventListener: {
                click: () => {
                    if (this.locked) return
                    if (this.appid.match(/^\d{12}$/g)) {
                        App({ req: "fetch_app", data: { id: this.appid } })
                    } else {
                        System({ req: "fetch_app", data: { id: this.appid } })
                    }
                },
                // mousedown: dragSymbol
            }
        })
    }
}


class DesktopSymbolApp extends DesktopSymbol {
    constructor({ position, appid, text, icon, description, contextmenu, locked, label }) {
        super({ position, appid, text, icon, description, contextmenu, locked, label });



        this.contextmenu = new ContextMenu(this.element, [{
            type: "title", label: text
        }, {
            type: "text", label: description || ""
        },
        {
            type: "divider"
        }, {
            "type": "list",
            "elements": [
                {
                    "label": "Open",
                    "symbol": "bx-window-open",
                    handler: (event) => {
                        if (this.locked) return
                        if (this.appid.match(/^\d{12}$/g)) {
                            App({ req: "fetch_app", data: { id: this.appid } })
                        } else {
                            System({ req: "fetch_app", data: { id: this.appid } })
                        }
                    }
                },
                {
                    "label": locked?"Unlock":"Lock",
                    "symbol": locked?"bx-lock-open-alt":"bx-lock-alt",
                    handler: ({target}) => {
                        if (target.tagname != "CONTEXT-MENU-ELEMENT") target = target.parentNode;
                        this.locked = !this.locked
                        System({ req: "lock_app", data: {id: this.appid, state: this.locked}})
                        console.log(target.childNodes)
                        target.childNodes[0].classList.toggle("bx-lock-alt")
                        target.childNodes[0].classList.toggle("bx-lock-open-alt")
                        target.childNodes[1].innerText = this.locked?"Unlock":"Lock"
                    }
                },
                {
                    label: "Rename",
                    symbol: "bx-rename",
                    handler: (event) => {
                        // Call a dialog box or ideally put a textbox in the desktop symbol, something like this
                        console.log(this.element)
                    }
                }
            ]
        }, {
            "type": "divider"
        },
        ...this.contextmenu,
        {
            type: "grid",
            elements: [
                {
                    label: "Delete",
                    symbol: "bx-trash-alt"
                }, {
                    label: "Copy",
                    symbol: "bx-copy bx-xs"
                }, {
                    label: "Cut",
                    symbol: "bx-cut bx-xs"
                }
            ]
        }]);

        this.element.contextMenu = this.contextmenu;
    }

}

export { DesktopSymbolApp }