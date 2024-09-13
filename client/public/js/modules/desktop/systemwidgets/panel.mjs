import { contextMenu } from "../../../Handlers.mjs";
import { ContextMenu } from "../../ui.mjs";
import { create, randomId } from "../../Util.mjs";
import { Window } from "../../Window.mjs";

const horizontal = ["left", "center", "right"]
const vertical = ["top", "center", "bottom"]
const flex = ["flex-start", "center", "flex-end"]

const backdrop = create({
    tagname: "div",
    style: `backdrop-filter: blur(2px) contrast(0.5) saturate(0.5);
    width: 100%;
    height: 100%;
    z-index: -1;
    display: block;
    position: fixed;
    z-index: -1`
})

class Panel {
    hasBackdrop = [false, false]
    element;
    #applets = [];
    contextmenu;
    anchorH;
    anchorV;
    offsetX;
    offsetY;
    floating;
    fullwidth;
    locked;
    edgeselector;
    id;
    settingsWindow;
    height; width;
    #desktop;
    constructor({ width, height, offsetX, offsetY, anchorX, anchorY, rgb, alpha, floating = false, fullwidth = false, locked = false }, Desktop) {
        this.id = randomId(12);
        this.locked = locked;
        this.#desktop = Desktop;
        this.edgeselector = new EdgeSelector(this, Desktop)
        this.anchorH = horizontal[Math.abs(horizontal.indexOf(anchorX))];
        this.anchorV = vertical[Math.abs(vertical.indexOf(anchorY))];
        this.floating = floating;
        this.fullwidth = fullwidth;
        this.settingsWindow = new PanelOptions(this, Desktop)
        this.height = height;
        this.width = width;
        this.offsetX = offsetX
        this.offsetY = offsetY
        this.element = create({
            tagname: "desktop-panel",
            style: {
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
            locked: this.locked,
            edgeX: anchorX,
            edgeY: anchorY,
            dataset: {
                stopCtxPropagation: true
            },
            eventListener: {
                keydown: (e) => {
                    console.log(e);
                    if (e.key == "escape") {
                        this.edgeselector.hide()
                    }
                },
                click: (e) => {
                    e.stopPropagation()
                },
                contextmenu: (e) => {
                    e.stopPropagation();
                    contextMenu(e)
                }
            },
            childElements: [this.settingsWindow.element]
        })
        this.element.style.setProperty("--margin-block", offsetX + "px")
        this.element.style.setProperty("--margin-inline", offsetY + "px")
        this.element.style.setProperty("--panel-height", (typeof height == "number") ? (height + "px") : height)
        this.element.style.setProperty("--panel-width", (typeof width == "number") ? (width + "px") : width)
        this.#makeContextMenu();
    }

    #makeContextMenu() {
        const ctxRaw = [
            { type: "title", label: "Panel" },
            {
                type: "text", label: `Debug info:<br>Vertical: ${this.anchorH}<br>
            Horizontal: ${this.anchorV}<br>
            Floating: ${this.floating ? "Yes" : "No"}<br>
            Locked: ${this.locked?"Yes":"No"}`
            },
            { type: "divider" },
            {
                type: "list",
                items: [
                    {
                        label: "Floating",
                        symbol: this.floating ? "bxs-checkbox-checked" : "bx-checkbox",
                        handler: () => {
                            console.log(this.element.floating)
                            if (this.locked) return;
                            this.setFloating(!this.floating)
                        },
                        enabled: !this.locked
                    }, {
                        label: "Full width",
                        symbol: this.fullwidth ? "bxs-checkbox-checked" : "bx-checkbox",
                        handler: () => {
                            console.log(this.element.fullwidth)
                            if (this.locked) return;
                            this.setFullWidth(!this.fullwidth)
                        },
                        enabled: !this.locked
                    }, {
                        label: this.locked ? "Unlock" : "Lock",
                        symbol: this.locked ? "bx-lock-open-alt" : "bx-lock-alt",
                        handler: () => {
                            console.log(this.element.locked)
                            this.setLockedState(!this.getLockedState())
                        }
                    }, {
                        label: "Set position",
                        symbol: "bx-move",
                        handler: () => {
                            if (this.locked) return;
                            let panels = this.#desktop.getPanels()
                            console.log(panels)
                            this.hasBackdrop[0] = true
                            for (let i = 0; i < panels.length; i++) {
                                if (this != panels[i]) {
                                    panels[i].settingsWindow.hide();
                                    panels[i].edgeselector.hide();
                                    console.log("t3wtw3t")
                                    console.log(panels[i].edgeselector)
                                }
                            }
                            this.edgeselector.show()
                        },
                        enabled: !this.locked
                    }, {
                        label: "More Options...",
                        symbol: "bx-cog",
                        handler: () => {
                            if (this.locked) return;
                            // show option dialog
                            let panels = this.#desktop.getPanels()
                            console.log(panels)
                            this.hasBackdrop[1] = true
                            for (let i = 0; i < panels.length; i++) {
                                if (this != panels[i]) {
                                    panels[i].settingsWindow.hide();
                                    panels[i].edgeselector.hide();
                                    console.log("t3wtw3t")
                                    console.log(panels[i].edgeselector)
                                }
                            }
                            this.settingsWindow.show()
                        },
                        enabled: !this.locked
                    }
                ]
            }
        ]
        this.contextmenu = new ContextMenu(this.element, ctxRaw)
        this.element.contextMenu = this.contextmenu
    }

    setEdge({ x = "center", y = "center" }) {


        console.log("set edge", x, horizontal[Math.abs(vertical.indexOf(x))], flex[Math.abs(horizontal.indexOf(x))], "|", y, vertical[Math.abs(vertical.indexOf(y))], flex[Math.abs(horizontal.indexOf(y))], "\n", horizontal, "\n", vertical)


        this.anchorH = horizontal[Math.abs(horizontal.indexOf(x))];
        this.element.style["justify-self"] = flex[Math.abs(horizontal.indexOf(x))]
        this.element.setAttribute("edgeX", x)

        this.anchorV = vertical[Math.abs(vertical.indexOf(y))]
        this.element.style["align-self"] = flex[Math.abs(vertical.indexOf(y))]
        this.element.setAttribute("edgeY", y)
        this.#makeContextMenu()
        this.settingsWindow.setEdge({ x: x, y: y })
    }

    setFloating(float) {
        console.log(float, this.element.floating)
        this.floating = float;
        this.element.setAttribute("floating", float);
        this.#makeContextMenu()
    }

    getFullwidth() {
        return this.fullwidth
    }

    setFullWidth(fullwidth) {
        this.fullwidth = fullwidth
        this.element.setAttribute("fullwidth", fullwidth)
        this.#makeContextMenu()
    }

    getLockedState() {
        return this.locked
    }

    setLockedState(l) {
        this.locked = l;
        this.element.setAttribute("locked", l)
        this.#makeContextMenu()
    }

}

class EdgeSelector {
    #parent;
    element;
    #backdrop;
    #desktop;
    constructor(parent, desktop) {
        this.#desktop = desktop
        this.#parent = parent;
        this.element = create({
            tagname: "edge-selector-container",
            eventListener: {
                click: (e) => {
                    this.#parent.hasBackdrop = [false, false]
                    e.stopPropagation();
                    this.hide()
                }
            },
            childElements: [
                {
                    tagname: "edge-selector",
                    edgeX: "left",
                    edgeY: "top",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ x: "left", y: "top" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-315", "bx-lg"]
                        }
                    ]
                }, {
                    tagname: "edge-selector",
                    edgeX: "center",
                    edgeY: "top",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ y: "top" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "bx-lg"]
                        }
                    ]
                }, {
                    tagname: "edge-selector",
                    edgeX: "right",
                    edgeY: "top",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ x: "right", y: "top" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-45", "bx-lg"]
                        }
                    ]
                }, {
                    tagname: "edge-selector",
                    edgeX: "left",
                    edgeY: "center",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ x: "left" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-270", "bx-lg"]
                        }
                    ]
                }, {
                    tagname: "edge-selector",
                    edgeX: "right",
                    edgeY: "center",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ x: "right" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-90", "bx-lg"]
                        }
                    ]
                }, {
                    tagname: "edge-selector",
                    edgeX: "left",
                    edgeY: "bottom",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ x: "left", y: "bottom" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-225", "bx-lg"]
                        }
                    ]
                }, {
                    tagname: "edge-selector",
                    edgeX: "center",
                    edgeY: "bottom",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ y: "bottom" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-180", "bx-lg"]
                        }
                    ]
                }, {
                    tagname: "edge-selector",
                    edgeX: "right",
                    edgeY: "bottom",
                    eventListener: {
                        click: (e) => {
                            this.#parent.setEdge({ x: "right", y: "bottom" });
                            e.stopPropagation()
                            this.hide();
                        }
                    },
                    childElements: [
                        {
                            tagname: "i",
                            classList: ["bx", "bx-chevron-up", "rotate-135", "bx-lg"]
                        }
                    ]
                },
            ]
        })
    }



    show() {
        // document.querySelector("desktop-environment").style.scale = 0.9;
        // this.#parent.element.parentNode.append(backdrop);
        this.#desktop.enterEditMode()
        this.#parent.element.style["z-index"] = 101;
        this.#parent.element.style.border = "solid 2px var(--panel-highlight-color)"
        document.body.append(this.element)
        console.log(this.#parent.element)
    }

    hide() {
        this.#parent.hasBackdrop[0] = false;
        if (!this.#parent.hasBackdrop[1]) {
            this.element.remove();
            this.#desktop.exitEditMode()
            // document.querySelector("desktop-environment").style.scale = 1;
            backdrop.remove();
            this.#parent.element.style["z-index"] = undefined
            this.#parent.element.style.borderStyle = "var(--panel-border-style)"
            this.#parent.element.style.borderWidth = "var(--panel-border-width)"
            this.#parent.element.style.borderColor = "var(--panel-border-color)"
        }

    }
}

class PanelOptions {
    element;
    #parent;
    #backdrop;
    #desktop;
    constructor(parent, desktop) {
        this.#desktop = desktop
        this.#parent = parent
        /*
        Floating: toggle
        Width: Fit, Fix:Number px, Full
        Height: Number px,
        OffsetX: Number px,
        OffsetY: Number px,
        Color: Color,
        Transparency: Number 0..1
        */
        // console.log(this.#parent.offsetY, this.#parent.height, 6, "px")
        this.element = create({
            tagname: "panel-settings",
            style: {
                "justify-self": flex[Math.abs(horizontal.indexOf(this.#parent.anchorH))]
            },
            eventListener: {
                click: (e) => { e.stopPropagation(); this.#parent.contextmenu.hide(); this.hide() }
            },
            dataset: { hidden: true },
            edgeH: this.#parent.anchorH,
            edgeV: this.#parent.anchorV,
            dataset: {
                stopCtxPropagation: true,
                hidden: true
            },
            innerText: "There will be settings here, trust"
        })
        document.querySelector("desktop-environment").addEventListener("click", (e) => { this.#parent.hasBackdrop = [false, false]; this.hide(e) })
        document.querySelector("desktop-environment").addEventListener("contextmenu", (e) => { this.#parent.hasBackdrop = [false, false]; this.hide(e) })

    }

    setEdge({ x = "center", y = "center" }) {


        // console.log("set edge", x, horizontal[Math.abs(vertical.indexOf(x))], flex[Math.abs(horizontal.indexOf(x))], "|", y, vertical[Math.abs(vertical.indexOf(y))], flex[Math.abs(horizontal.indexOf(y))], "\n", horizontal, "\n", vertical)


        this.element.setAttribute("edgeH", x)

        this.element.setAttribute("edgeV", y)
    }

    show() {
        this.element.dataset.hidden = false;
        // document.querySelector("desktop-environment").style.scale = 0.9;
        // this.#parent.element.parentNode.append(backdrop);
        this.#parent.element.style["z-index"] = 101;
        this.#parent.element.style.border = "solid 2px var(--panel-highlight-color)"
        this.#desktop.enterEditMode();
        // console.log(this.#parent)
        // console.log(this.#parent.offsetY , this.#parent.height , 6 , "px")
        // this.element.style.marginBlock = (this.#parent.floating * this.#parent.offsetY + this.#parent.height + 6) + "px"
        // document.querySelectorAll("desktop-layer")[5].append(this.element)
        setTimeout(() => {
            this.element.style.transition = "none"
        }, 150);
    }

    hide(e) {
        this.element.style.transition = "translate 0.15s ease, visibility 0.1s ease 0.1s"
        this.#parent.hasBackdrop[1] = false;
        this.element.dataset.hidden = true;
        if (!this.#parent.hasBackdrop[0]) {
            // document.querySelector("desktop-environment").style.scale = 1;
            // backdrop.remove();
            this.#parent.element.style["z-index"] = undefined
            this.#desktop.exitEditMode()
            this.#parent.element.style.borderStyle = "var(--panel-border-style)"
            this.#parent.element.style.borderWidth = "var(--panel-border-width)"
            this.#parent.element.style.borderColor = "var(--panel-border-color)"
            this.#parent.edgeselector.hide()
        }

    }

}

export { Panel }
