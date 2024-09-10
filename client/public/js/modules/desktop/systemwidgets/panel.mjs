import { ContextMenu } from "../../ui.mjs";
import { create } from "../../Util.mjs";

const horizontal = ["left", "center", "right"]
const vertical = ["top", "center", "bottom"]
const flex = ["flex-start", "center", "flex-end"]

class Panel {
    element;
    #applets = [];
    #contextmenu;
    #anchorH;
    #anchorV
    #floating;
    #fullwidth;
    #edgeselector;

    constructor({ width, height, offsetX, offsetY, anchorX, anchorY, rgb, alpha, floating = false, fullwidth = false }) {
        this.#edgeselector = new EdgeSelector(this)
        this.#anchorH = horizontal[Math.abs(horizontal.indexOf(anchorX))];
        this.#anchorV = vertical[Math.abs(vertical.indexOf(anchorY))];
        this.#floating = floating;
        this.#fullwidth = fullwidth;
        this.element = create({
            tagname: "desktop-panel",
            style: {
                "width": (typeof width == "number") ? (width + "px") : width,
                "height": (typeof height == "number") ? (height + "px") : height,
                // "margin-inline": offsetX + "px",
                // "margin-block": offsetY + "px",
                "justify-self": flex[Math.abs(horizontal.indexOf(anchorX))],
                "align-self": flex[Math.abs(vertical.indexOf(anchorY))],
                "background": `rgba(${(typeof rgb.r == "number" && rgb.r < 256 && rgb.r >= 0) ? rgb.r : "var(--panel-background-r)"},
                                    ${(typeof rgb.g == "number" && rgb.g < 256 && rgb.g >= 0) ? rgb.g : "var(--panel-background-g)"},
                                    ${(typeof rgb.b == "number" && rgb.b < 256 && rgb.b >= 0) ? rgb.b : "var(--panel-background-b)"},
                                    ${alpha})`
            },
            floating: floating,
            fullwidth: fullwidth,
            edgeX: anchorX,
            edgeY: anchorY,
            eventListener: {
                keydown: (e) => {
                    console.log(e);
                    if (e.key == "escape") {
                        this.#edgeselector.remove()
                    }
                }
            }
        })
        this.element.style.setProperty("--margin-block", offsetX + "px")
        this.element.style.setProperty("--margin-inline", offsetY + "px")
        this.#makeContextMenu();
    }

    #makeContextMenu() {
        const ctxRaw = [
            { type: "title", label: "Panel" },
            {
                type: "text", label: `Vertical: ${this.#anchorH}<br>
            Horizontal: ${this.#anchorV}<br>
            Floating: ${this.#floating ? "Yes" : "No"}`
            },
            {type: "divider"},
            {
                type: "list",
                items: [
                    {
                        label: "Floating",
                        symbol: this.#floating?"bxs-checkbox-checked":"bx-checkbox",
                        handler: () => {
                            console.log(this.element.floating)
                            this.setFloating(!this.#floating)
                        }
                    },{
                        label: "Full width",
                        symbol: this.#fullwidth?"bxs-checkbox-checked":"bx-checkbox",
                        handler: () => {
                            console.log(this.element.fullwidth)
                            this.setFullWidth(!this.#fullwidth)
                        }
                    },{
                        label: "Set position",
                        symbol: "bx-move",
                        handler: () => {
                            this.#edgeselector.show()
                        }
                    },
                ]
            }
        ]
        this.#contextmenu = new ContextMenu(this.element, ctxRaw)
        this.element.contextMenu = this.#contextmenu
    }

    setEdge({x = "center", y = "center"}) {


        console.log("set edge", x, horizontal[Math.abs(vertical.indexOf(x))], flex[Math.abs(horizontal.indexOf(x))], "|", y, vertical[Math.abs(vertical.indexOf(y))], flex[Math.abs(horizontal.indexOf(y))], "\n", horizontal, "\n", vertical)


        this.#anchorH = horizontal[Math.abs(horizontal.indexOf(x))];
        this.element.style["justify-self"] = flex[Math.abs(horizontal.indexOf(x))]
        this.element.setAttribute("edgeX", x)

        this.#anchorV = vertical[Math.abs(vertical.indexOf(y))]
        this.element.style["align-self"] = flex[Math.abs(vertical.indexOf(y))]
        this.element.setAttribute("edgeY", y)
        this.#makeContextMenu()
    }

    setFloating(float) {
        console.log(float, this.element.floating)
        this.#floating = float;
        this.element.setAttribute("floating", float);
        this.#makeContextMenu()
    }

    getFullwidth() {
        return this.#fullwidth
    }

    setFullWidth(fullwidth) {
        this.#fullwidth = fullwidth
        this.element.setAttribute("fullwidth", fullwidth)
        this.#makeContextMenu()
    }
}

class EdgeSelector {
    #parent;
    element;
    constructor(parent) {
        this.#parent = parent;
        this.element = create({
            tagname: "edge-selector-container",
            eventListener: {
                click: () => {this.remove()}
            },
            childElements: [
                {
                    tagname: "edge-selector",
                    edgeX: "left",
                    edgeY: "top",
                    eventListener: {
                        click: () => {this.#parent.setEdge({x: "left", y: "top"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up","rotate-315", "bx-lg"]
                        }
                    ]
                },{
                    tagname: "edge-selector",
                    edgeX: "center",
                    edgeY: "top",
                    eventListener: {
                        click: () => {this.#parent.setEdge({y: "top"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "bx-lg"]
                        }
                    ]
                },{
                    tagname: "edge-selector",
                    edgeX: "right",
                    edgeY: "top",
                    eventListener: {
                        click: () => {this.#parent.setEdge({x: "right", y: "top"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-45", "bx-lg"]
                        }
                    ]
                },{
                    tagname: "edge-selector",
                    edgeX: "left",
                    edgeY: "center",
                    eventListener: {
                        click: () => {this.#parent.setEdge({x: "left"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-270", "bx-lg"]
                        }
                    ]
                },{
                    tagname: "edge-selector",
                    edgeX: "right",
                    edgeY: "center",
                    eventListener: {
                        click: () => {this.#parent.setEdge({x: "right"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up","rotate-90", "bx-lg"]
                        }
                    ]
                },{
                    tagname: "edge-selector",
                    edgeX: "left",
                    edgeY: "bottom",
                    eventListener: {
                        click: () => {this.#parent.setEdge({x: "left", y: "bottom"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up","rotate-225", "bx-lg"]
                        }
                    ]
                },{
                    tagname: "edge-selector",
                    edgeX: "center",
                    edgeY: "bottom",
                    eventListener: {
                        click: () => {this.#parent.setEdge({y: "bottom"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up","rotate-180", "bx-lg"]
                        }
                    ]
                },{
                    tagname: "edge-selector",
                    edgeX: "right",
                    edgeY: "bottom",
                    eventListener: {
                        click: () => {this.#parent.setEdge({x: "right", y: "bottom"})}
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up","rotate-135", "bx-lg"]
                        }
                    ]
                },
            ]
        })
    }
    show() {
        document.body.append(this.element)
    }

    remove() {
        this.element.remove();
    }
}

export { Panel }
