import { create } from "../Util.mjs";
/*

[
    {
        type: "list" | "grid" | "divider",
        elements: [
            // for divider, elements are ignored
            {
                label: String,
                handle: Function,
                symbol: URL/boxicon,
                submenu: Array, congruent to elements, optional, coming soon, not advised
            }
        ]
    },
    {
        type: "text",
        label: String
    }
]

*/
class ContextMenu {
    #element;
    #timeout;
    #structure = [];
    parent;
    constructor(parentElement, elements) {
        this.parent = parentElement;
        if (!(elements instanceof Array)) throw new TypeError("class ContextMenu: constructor requires Array.")
        if (elements.length == 0) throw new ReferenceError("class ContextMenu: Array must not be of length 0.")
        this.#element = create({
            tagname: "context-menu"
        })

        for (let i = 0; i < elements.length; i++) {
            let e;
            switch (elements[i].type) {
                case "grid":
                    e = new ContextMenuGrid(
                        elements[i].elements.map(a => new ContextMenuGridElement(a.label, a.symbol, a.handler))
                    )
                    this.#structure.push(e)
                    e = e.element;
                    break;
                case "list":
                    e = new ContextMenuList(
                        elements[i].elements.map(a => new ContextMenuListElement(a.label, a.symbol, a.handler))
                    )
                    this.#structure.push(e);
                    e = e.element;
                    break;
                case "divider":
                    e = new ContextMenuDivider();
                    this.#structure.push(e);
                    e = e.element;
                    break;
                case "title":
                    e = new ContextMenuTitle(elements[i].label)
                    this.#structure.push(e)
                    e = e.element;
                    break;
                case "text":
                    e = new ContextMenuDescription(elements[i].label)
                    this.#structure.push(e)
                    e = e.element;
                    break;
            }
            this.#element.append(e);
        }
    }
    
    debug() {
        console.log(this.#structure)
    }
    
    show(x, y) {
        clearTimeout(this.#timeout)

        let width = 240; // needs to somehow be theme dependent once those are a thing
        if (x + width > window.innerWidth) x -= width; // if menu would be off screen horizontally, spawn left of cursor
        this.#element.style.left = x + "px";
        this.#element.style.top = y + "px";
        document.body.append(this.#element)
        // takes the dimensions on screen, if off screen vertically, moves it up so its flush with bottom of screen
        // needs to be appended to DOM first before the height is accessible
        if (y + this.#element.clientHeight > window.innerHeight) this.#element.style.top = window.innerHeight - this.#element.clientHeight + "px"
        this.#element.dataset.visible = "true"
    }

    hide() {
        this.#element.dataset.visible = "false"
        this.#timeout = setTimeout(() => {
            this.#element.remove();
        }, 100);

    }
}

class ContextMenuText {
    #text;
    element;
    constructor(text) {
        this.#text = text
        this.element = create({
            tagname: "span",
            innerHTML: text
        })
    }
}

class ContextMenuDescription extends ContextMenuText {
    constructor(text) {
        super(text);
        this.element.classList.add("text")
    }
}

class ContextMenuTitle extends ContextMenuText {
    constructor(text) {
        super(text);
        this.element.classList.add("title")
    }
}

class ContextMenuDivider {
    element = create({ tagname: "hr" });
}

class ContextMenuList {
    element;
    #structure = []
    constructor(elements) {
        console.log(elements)
        this.#structure = elements
        this.element = create({
            tagname: "context-menu-list",
            childElements: elements.map(a => a.element)
        })
    }
}


class ContextMenuGrid {
    element;
    #structure = [];
    constructor(elements) {
        this.#structure = elements
        this.element = create({
            tagname: "context-menu-grid",
            style: {
                "grid-template-rows": `repeat(${Math.ceil(elements.length / 5)}, 36px)`
            },
            childElements: elements.map(a => a.element)
        })
    }
}

class ContextMenuElement {
    symbol;
    label
    handler;
    element;
    constructor(label, handler, symbol) {
        if (handler && typeof handler != "function") throw new TypeError("class ContextMenuElement: optional argument handler must be a function")
        if (label == undefined || label == null || label == "") throw new ReferenceError("class ContextMenuElement: argument label must be non-empty string.")

        if (symbol) {
            this.symbol = [...(symbol.split(" "))];
            for (let i in this.symbol) {
                if (!this.symbol[i].match(/^bxs?-.*$/gi)) throw new ReferenceError("class ContextMenuElement: symbols must be boxicon symbols, check the reference: https://boxicons.com/. Got '" + symbol + "' instead. You can leave out the generic 'bx' class, only include the relevant parts (name, size, animation, orientation")
            }
        }
        this.label = label;
        this.handler = handler;
    }
}

class ContextMenuListElement extends ContextMenuElement {
    constructor(label, symbol, handler) {
        super(label, handler, symbol);
        console.log(handler, this.handler)
        this.element = create({
            tagname: "context-menu-element",
            childElements: [
                { tagname: "i", classList: ["bx", this.symbol] },
                { tagname: "span", innerText: this.label }
            ],
            eventListener: {
                click: (event) => {
                    // Something was supposed to go here but i dont remember rn
                    if (this.handler) this.handler(event);
                }
            }
        })
    }
}

class ContextMenuGridElement extends ContextMenuElement {
    constructor(label, symbol, handler) {
        super(label, handler, symbol);
        if (!symbol) console.trace("class ContextMenuGridElement: grid icons must have an icon.")
        this.element = create({
            tagname: "context-menu-element",
            childElements: [{ tagname: "i", classList: ["bx", ...(this.symbol || [])] }],
            dataset: { label: this.label }
        })
    }
}
export { ContextMenu }