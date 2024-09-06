import { Widget } from "./widget.mjs";
import { deleteElement } from "../Util.mjs";
/*
Panels: layer 5, z-index 1 000 000
Windows: layer 3, z-index starts at 1 000
desktop symbols: layer 1, z-index 0
widgets: layers 0,2,4, customisable, defines draw order
layer 4: z-index 100 000
*/
class Desktop {
    #panels = [];
    #widgets = [];
    #windows = [];
    #symbols = [];
    #contextMenu;
    #hub;
    #background;
    element;

    constructor(data) {

    }

    hide() {
        for (let i = 0; i < this.#widgets.length; i++) {
            this.#widgets[i].remove();
        }
        for (let i = 0; i < this.#widgets.length; i++) {
            this.#panels[i].remove();
        }
        for (let i = 0; i < this.#widgets.length; i++) {
            this.#symbols[i].remove();
        }
        for (let i = 0; i < this.#widgets.length; i++) {
            this.#windows[i].remove();
        }
    }

    removePanel(panel) {
        panel.remove()
        deleteElement(this.#panels, this.#panels.indexOf(panel))
    }

    removeWidget(widget) {
        widget.remove()
        deleteElement(this.#widgets, this.#widgets.indexOf(widget))
    }

    removeDesktopSymbol(symbol) {
        symbol.remove();
        deleteElement(this.#symbols, this.#symbols.indexOf(symbol))
    }

    removeWindow(window) {
        window.remove();
        deleteElement(this.#windows, this.#windows.indexOf(window))
    }
}

export {Widget}
