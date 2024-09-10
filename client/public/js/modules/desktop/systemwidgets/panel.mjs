import { create } from "../../Util.mjs";

class Panel  {
    element;
    #applets = [];

    constructor({width, height, offsetX, offsetY, anchorX, anchorY, rgb, alpha}) {
        const horizontal = ["left", "center", "right"]
        const vertical = ["top", "center", "bottom"]
        const flex = ["flex-start", "center", "flex-end"]

        this.element = create({
            tagname: "desktop-panel",
            style: {
                "width": (typeof width == "number")?(width + "px"):width,
                "height": (typeof height == "number")?(height + "px"):height,
                "margin-inline": offsetX + "px",
                "margin-block": offsetY + "px",
                "justify-self": flex[Math.abs(horizontal.indexOf(anchorX))],
                "align-self": flex[Math.abs(vertical.indexOf(anchorY))],
                "background": `rgba(${(typeof rgb.r == "number" && rgb.r < 256 && rgb.r >= 0)?rgb.r:"var(--panel-background-r)"},
                                    ${(typeof rgb.g == "number" && rgb.g < 256 && rgb.g >= 0)?rgb.g:"var(--panel-background-g)"},
                                    ${(typeof rgb.b == "number" && rgb.b < 256 && rgb.b >= 0)?rgb.b:"var(--panel-background-b)"},
                                    ${alpha})`
            }
        })
    }
}

export { Panel }
