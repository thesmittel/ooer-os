/**
 * Color wheel UI element
 * @file colorwheel.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:UIElements > ColorWheel
 */
/**
 * Color wheel UI element
 * @file colorwheel.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:UIElements > ColorWheel
 * @namespace ClientCode.UIElements
 */
/**
 * @module ColorWheel
 * @memberof Client:UIElements
 * @description Color wheel UI element
 * @name Client:UIElements > ColorWheel
 * @author Smittel
 */

import { SliderGroup, TextboxSlider } from "./textslider.mjs";
import { nthParent, round, map, clamp, cartesianToPolar, polarToCartesian, radianToDegree, degreeToRadian, Color } from "../../Util.mjs";

/**
 * Color wheel class
 */
class Wheel {
    closable = true;
    activeSelector;
    parentElement;
    sliderValues;
    visualSlider;
    #slidertext;
    mousedown;
    mode;
    target;

    element;

    #slideGroupArr;
    #slideGroup;
    #alphaSlider
    #brightnessBar;
    #hueSatWheel;
    #sliderContainer;
    #sliderGroupDomArr
    backdrop;
    #hexbox;
    /**
     * Creates a color wheel and attaches it to the parent element, hidden by default.
     * Color wheels close when they lose focus. <br>
     * If present, the color wheel uses the color data attached to the parentElement, use data-r, data-g, data-b, data-a attributes for the corresponding color channels, RGB is integers from 0 to 255, alpha is floats from 0 to 1<br>
     * If these are not present, the class will initialise RGB to black with 100% alpha and attach the attributes to the parent element. <br>
     * CAREFUL! If they are present but are not a number, they will be replaced!<br>
     * It is also recommended to not have anything of value in the parent element, ideally you want to make it something that merely displays the color, because the background color gets updated automatically. It does NOT however automatically add the eventListener to the parent element, reason being that there might be different ways you might want to let the user open it.
     * @param {HTMLElement} parentElement
     */
    constructor(parentElement) {
        // If provided element is not dom element, throw up in a tantrum bc what else is there to do
        if (!parentElement.tagName) {
            throw new TypeError("class Wheel: argument parentElement must be DOM Element, got " + typeof this.parentElement)
        }
        let { r, g, b, a } = parentElement.dataset;
        if (r===undefined || isNaN(r)) parentElement.dataset.r = r = 0;
        if (g===undefined || isNaN(g)) parentElement.dataset.g = g = 0;
        if (b===undefined || isNaN(b)) parentElement.dataset.b = b = 0;
        if (a===undefined || isNaN(a)) parentElement.dataset.a = a = 1;
        const { h, s, v } = Color.rgb.toHsv({ r: r, g: g, b: b })
        this.parentElement = parentElement;
        this.#brightnessSlider();
        this.#makeWheel();

        this.#slideGroup = new SliderGroup([
            { min: 0, max: 255, step: 1, val: parentElement.dataset.r, label: "R" },
            { min: 0, max: 255, step: 1, val: parentElement.dataset.g, label: "G" },
            { min: 0, max: 255, step: 1, val: parentElement.dataset.b, label: "B" },
        ])
        this.#slideGroup.setStyle("grid-area: 2 / 1 / 3 / 4;")
        // this.#slideGroup.getElements()[0].setParameters({min: 10, max: 16, step: 2, val: 12})
        this.#slideGroup.element.addEventListener("update", (e) => {
            this.#updateFromSlider(e)
        })
        this.#alphaSlider = new TextboxSlider({ min: 0, max: 1, step: 0.001, val: parentElement.dataset.a, label: "A" })
        this.#alphaSlider.setStyle("grid-area: 3 / 1 / 4 / 4;")
        this.#hexbox = create({
            tagname: "hex-box",
            style: "grid-area: 2 / 1 / 3 / 4; visibility: hidden;",
            dataset: { value: "0A0A0A" },
            innerHTML: `<span>HEX #</span><input type="text" maxlength="6" value="${Color.rgb.toHex(parentElement.dataset)}"/>`,
        })

        function hexboxout(e) {
            if (e.target.value.match(/^([0-9a-fA-F]{3})$/g)) {
                console.log(3)
                let chars = [e.target.value.charAt(0), e.target.value.charAt(1), e.target.value.charAt(2)];
                e.target.parentNode.dataset.value = `${chars[0]}${chars[0]}${chars[1]}${chars[1]}${chars[2]}${chars[2]}`
                e.target.value = e.target.parentNode.dataset.value;
            } else if (/^[0-9a-fA-F]{6}$/g) {
                console.log(6)
                e.target.parentNode.dataset.value = e.target.value;
            } else {
                e.target.value = e.target.parentNode.dataset.value;
                e.target.blur()
                return;
            }
            const { r, g, b } = Color.hex.toRgb(e.target.parentNode.dataset.value)
            const { h, s, v } = Color.hex.toHsv(e.target.parentNode.dataset.value)
            const mainParent = nthParent(e.target, 3)

            mainParent.dataset.r = r
            mainParent.dataset.g = g
            mainParent.dataset.b = b
            mainParent.dataset.h = h
            mainParent.dataset.s = s
            mainParent.dataset.v = v

            e.target.blur()
        }

        this.#hexbox.querySelector("input").addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                hexboxout(e);
            }
        })
        this.#hexbox.querySelector("input").addEventListener("focusout", hexboxout)
        this.#hexbox.setAttribute('maxLength', 6);
        this.#sliderContainer = create({
            tagname: "colorpicker-slidercontainer",
            dataset: {
                colormode: "RGB"
            },
            childElements: [
                ...this.#makeColorModeButtonObjects(),
                this.#slideGroup.element,
                this.#hexbox,
                this.#alphaSlider.element
            ]
        })
        const { x, y, height, width } = parentElement.getBoundingClientRect()


        this.element = create({
            tagname: "colorpicker-container",
            eventListener: {
                click: (e) => { e.stopPropagation() },
                mousedown: () => {
                    this.closable = false;
                    document.addEventListener("mouseup", this.#resetClosable)
                }
            },
            style: `top: ${y + height / 2}px; left: ${x + width}px; transform: translateY(-50%);`,
            childElements: [
                this.#brightnessBar,
                this.#hueSatWheel,
                this.#sliderContainer
            ],
            dataset: { r: r, g: g, b: b, a: a, h: h, s: s, v: v, colormode: "RGB" }
        });


    }




    #brightnessSlider() {
        this.#brightnessBar = create({
            tagname: "colorpicker-brightness",
            eventListener: {
                mousedown: (e) => {
                    this.target = e.target
                    if (e.target.tagName == "COLORPICKER-INDICATOR") this.target = e.target.parentNode
                }
            },
            childElements: [
                {
                    tagname: "colorpicker-indicator"
                }
            ]
        })
    }

    #makeWheel() {
        this.#hueSatWheel = create({
            tagname: "colorpicker-wheel",
            childElements: [
                {
                    tagname: "colorpicker-saturation"
                },
                {
                    tagname: "colorpicker-huewheelbright"
                },
                {
                    tagname: "colorpicker-indicator",
                    eventListener: {
                        mousedown: (e) => {
                            this.target = e.target.parentNode.childNodes[3]
                        }
                    }
                },
                {
                    tagname: "colorpicker-huewheelmouse",
                    eventListener: {
                        mousedown: (e) => {
                            this.target = e.target
                        }
                    }
                }
            ]
        })
    }


    #brightnessChange(e, picker) {
        if (!picker.activeSelector || !picker.mousedown) return;

        const { height, padding, dY } = valueChangeParamGrab(picker.activeSelector, e)

        const relY = clamp(7 + padding, dY + 2 * padding, height + 2); // coordinates are top-to-bottom; relY is used as is for UI update

        const indicator = picker.activeSelector.childNodes[0];
        indicator.style.top = relY + "px";

        const brightnessmask = picker.activeSelector.parentNode.querySelector("colorpicker-huewheelbright")
        // const brightness = 1 - Math.round((relY - padding - 6) / (selector.height - padding - 6) * 10000) / 10000;     // This is what "normalises" relY to 0..1
        const brightness = map(relY, 7 + padding, height + 2, 100, 0)
        brightnessmask.style["backdrop-filter"] = `brightness(${brightness / 100})`
        picker.element.dataset.v = brightness

        // Calculate color according to colormode
        let colormode = picker.element.dataset.colormode;
        let color = picker.element.dataset;

        // Update RGB dataset in wheel
        const {r,g,b} = Color.hsv.toRgb(picker.element.dataset)
        picker.element.dataset.r = r
        picker.element.dataset.g = g
        picker.element.dataset.b = b

        picker.#changeSliders(true);
    }

    #hueSatChange(e, wheel) {
        if (!wheel.activeSelector || !wheel.mousedown) return;
        // necessary to calculate positions and colors
        // dX, dY are mouse positions relative to center of wheel
        const { width, height, dX, dY } = valueChangeParamGrab(wheel.activeSelector, e)
        const polar = cartesianToPolar({ x: dX - width / 2, y: dY - height / 2 });
        polar.r = clamp(0, polar.r, height / 2)

        const newCoords = polarToCartesian(polar)
        newCoords.x += width / 2;
        newCoords.y += height / 2;
        const indicator = wheel.activeSelector.parentNode.childNodes[2];
        indicator.style["background-color"] = `hsl(${Math.round(radianToDegree(polar.a))} 100% ${100 - Math.round(polar.r / height * 100)}%)`
        indicator.style.top = newCoords.y + "px";
        indicator.style.left = newCoords.x + "px";

        wheel.element.dataset.h = round(radianToDegree(polar.a), 2)
        wheel.element.dataset.s = Math.round(polar.r / height * 10000) / 50
        // console.log(wheel.element, wheel.activeSelector.parentNode.parentNode)

        // Calculate color according to colormode
        let colormode = wheel.element.dataset.colormode;
        let color = wheel.element.dataset;
        // Update RGB dataset in wheel
        const {r,g,b} = Color.hsv.toRgb(wheel.element.dataset)
        wheel.element.dataset.r = r
        wheel.element.dataset.g = g
        wheel.element.dataset.b = b

        wheel.#changeSliders(true);
    }

    #switchColorMode({ target }) {
        const buttons = Array.from(target.parentNode.querySelectorAll("colormode-button"))
        const newColorMode = target.dataset.mode;
        this.element.dataset.colormode = target.dataset.mode;

        if (newColorMode == "HEX") {
            this.#slideGroup.setStyle({ "visibility": "hidden" })
            this.#hexbox.style.visibility = "visible"
        } else if (newColorMode == "RGB" || newColorMode == "HSV") {
            this.#slideGroup.setStyle({ "visibility": "visible" })
            this.#hexbox.style.visibility = "hidden"
            const individualGroupElements = this.#slideGroup.getElements()
            for (let i = 0; i < newColorMode.length; i++) {
                individualGroupElements[i].setLabel(newColorMode.charAt(i))
            }
            // this.changeSliders(target.parentNode.parentNode)
        }
        buttons.forEach(a => a.dataset.selected = false);
        target.dataset.selected = true;
        target.parentNode.dataset.colormode = target.dataset.mode;
        this.#changeSliders()
    }

    #mousemove(e) {
        if (this.mode && this.mousedown) {
            this.#hueSatChange(e, this)
        } else {
            this.#brightnessChange(e, this)
        }
    }

    #updateDataset({r,g,b,h,s,v,a}) {

        if (r!==undefined) {
            this.element.dataset.r = r;
            this.parentElement.dataset.r = r;
        }
        if (g!==undefined) {
            this.element.dataset.b = b;
            this.parentElement.dataset.g = g;
        }
        if (b!==undefined) {
            this.element.dataset.g = g;
            this.parentElement.dataset.b = b;
        }
        if (a!==undefined) {
            this.element.dataset.a = a;
            this.parentElement.dataset.a = a;
        }
        if (h!==undefined) this.element.dataset.h = h;
        if (s!==undefined) this.element.dataset.s = s;
        if (v!==undefined) this.element.dataset.v = v;

    }

    // NO HEX HERE
    #updateFromSlider(e) {
        // detect color mode
        let {colormode} = this.element.dataset
        let values = e.detail.values();

        // calculate hsv if needed
        switch(colormode) {
            case "RGB":{
                var {h,s,v} = Color.rgb.toHsv({r: values[0], g: values[1], b: values[2]})
                var {r,g,b} = {r: values[0], g: values[1], b: values[2]}
                break
            }
            case "HSV":{
                var {h,s,v} = {h: values[0], s: values[1], v: values[2]}
                var {r,g,b} = Color.hsv.toRgb({h: values[0], s: values[1], v: values[2]})
                break
            }
        }
        h = round(h, 2); s = round(s, 1); v = round(v, 1);
        // update dataset
        this.#updateDataset({r:r,g:g,b:b,h:h,s:s,v:v})
        // new positions:
        // hs->polar
        // v=>Math.round(map(v, 0, 100, 136, 10)))
        const brightIndicator =this.#brightnessBar.querySelector("colorpicker-indicator");
        brightIndicator.style.top = Math.round(map(v, 0, 100, 136, 10)) + "px"

        const hueIndicator = this.#hueSatWheel.querySelector("colorpicker-indicator");
        const angle = degreeToRadian(h);
        const radius = s;
        let {x,y} = polarToCartesian({r: radius, a: angle})
        x = map(x, -100, 100, 0, this.#hueSatWheel.getBoundingClientRect().width)
        y = map(y, -100, 100, 0, this.#hueSatWheel.getBoundingClientRect().height)
        hueIndicator.style.top = y + "px"
        hueIndicator.style.left = x + "px"
        hueIndicator.style["background-color"] = `rgb(${r},${g},${b})`

        this.parentElement.style["background-color"] = `rgb(${r},${g},${b})`

        const huewheelbright = this.#hueSatWheel.querySelector("colorpicker-huewheelbright")
        huewheelbright.style = `backdrop-filter: brightness(${v/100})`
            // console.log("ACTUAL", )
            // console.log("NEW", Math.round(map(v, 0, 100, 136, 10)))
            // console.log("UPDATE", e.target.values, h,s,v)
    }

    #changeSliders(fireevent) {
        const { r, g, b, h, s, v, a, colormode} = this.element.dataset;
        // console.log(colormode, r,g,b,h,s,v,a)
        switch(colormode) {
            case "RGB": {
                this.#slideGroup.setParameters({
                    0: {min: 0, max: 255, step: 1, val: parseInt(r)},
                    1: {min: 0, max: 255, step: 1, val: parseInt(g)},
                    2: {min: 0, max: 255, step: 1, val: parseInt(b)}
                })
            }
            break;
            case "HSV": {
                this.#slideGroup.setParameters({
                    0: {min: 0, max: 360, step: .01, val: round((h), 2)},
                    1: {min: 0, max: 100, step: .1, val: round((s), 2)},
                    2: {min: 0, max: 100, step: .1, val: round((v), 2)}
                })
            } // todo: see textslider.mjs:244
            break;
            case "HEX": {
                let newcol = Color.rgb.toHex(this.element.dataset)
                this.#hexbox.childNodes[1].value = newcol;
            }
        }
        this.parentElement.style = `background-color: rgba(${r},${g},${b},${a})`
        this.#updateDataset({r:r,g:g,b:b,h:h,s:s,v:v})
        this.#hueSatWheel.querySelector("colorpicker-indicator").style["background-color"] = `rgba(${r},${g},${b},${a})`

    }



    #resetClosable() {
        setTimeout(() => {
            this.closable = true;
            document.removeEventListener("mouseup", ()=>this.#resetClosable())
        }, 1)
    }

    /**
     * Shows the color wheel
     */
    show() {

        // just grabbing a bunch of parameters
        const { x, y, width, height } = this.parentElement.getBoundingClientRect();
        const { r, g, b, a } = this.parentElement.dataset;
        const { h, s, v } = Color.rgb.toHsv({ r: r, g: g, b: b })



        // Initialises the sliders to the current value
        this.sliderValues = [
            Math.round(r / 2.55),
            Math.round(g / 2.55),
            Math.round(b / 2.55),
            Math.round(a)
        ]

        // carbon copy (no ref)
        this.visualSlider = [...this.sliderValues]
        this.#slidertext = [...this.sliderValues]
        // console.log("SHOW", this)

        this.backdrop = create({
            tagname: "div",
            classList: ["colorwheel-backdrop"],
            eventListener: {
                click: (e) => {
                    // only removes the color picker if a color isnt actively being selected
                    // in other words: only clicking outside the selector removes it
                    e.stopPropagation()
                    if (this.closable && e.target.tagName == "DIV") this.hide()
                }
            },
            childElements: [this.element]
        })



        this.backdrop.addEventListener("mousedown", (e) => {
            if (e.target == this.backdrop) {
                this.backdrop.remove()
                return;
            }
            document.activeElement.blur();
            e.stopPropagation();
            // e.preventDefault();
            // console.log(this.target)
            this.mousedown = true;
            this.closable = false;
            // if (!this.target || this.target.tagName == "DIV") return;
            this.#updateTarget(e)
        })
        this.backdrop.addEventListener("mousemove", (e) => {
            this.#updateTarget(e)
        })
        this.backdrop.addEventListener("mouseup", (e) => {
            this.#resetClosable(e);
            this.mousedown = false;
            this.activeSelector = null
            this.target = null;
        })

        document.body.append(this.backdrop)

        const brightCompStyle = window.getComputedStyle(this.#brightnessBar, null);
        const brightPad = parseInt(brightCompStyle.getPropertyValue("padding"))
        const brightHeight = parseInt(brightCompStyle["height"])
        const brightTop = Math.min(135, Math.round(brightHeight - (v / 100 * brightHeight)) + brightPad + 7) + "px";

        const hueCompStyle = window.getComputedStyle(this.#hueSatWheel, null);
        const hueHeight = parseInt(hueCompStyle["height"])
        const hueSat = polarToCartesian({ a: degreeToRadian(h), r: s / 200 * hueHeight });
        const hueStyle = `top: ${Math.round(hueSat.y + 64)}px; left: ${Math.round(hueSat.x + 64)}px; background-color: rgba(${r}, ${g}, ${b}, 1)`

        this.#hueSatWheel.childNodes[1].style["backdrop-filter"] = `brightness(${v / 100})`

        this.#brightnessBar.childNodes[0].style.top = brightTop;
        this.#hueSatWheel.childNodes[2].style = hueStyle;

    }

    /**
     * Hides the color wheel
     */
    hide() {
        this.backdrop.remove()
    }


    #updateDataset_old(target, mode) {
        console.log(target, mode)
        let sliders = Array.from(target.parentNode.querySelectorAll("textarea.color-slidetextbox")).map(a => Math.round(parseFloat(a.value) * 255));
        const finalParent = target.parentNode.parentNode;


        const wheel = finalParent.querySelector("colorpicker-wheel");
        const wind = wheel.childNodes[2];
        const wBrightMask = wheel.querySelector("colorpicker-huewheelbright")
        const bright = finalParent.querySelector("colorpicker-brightness")
        const bind = bright.childNodes[0];

        const newHSV = Color.rgb.toHsv({ r: sliders[0], g: sliders[1], b: sliders[2], a: sliders[3] })
        const coords = polarToCartesian({ a: degreeToRadian(newHSV.h), r: newHSV.s })
        let { padding, height, width } = valueChangeParamGrab(wheel, { clientX: 0, clientY: 0 })
        console.log(coords)
        console.log(newHSV)
        console.log(
            finalParent.dataset.r = sliders[0],
            finalParent.dataset.g = sliders[1],
            finalParent.dataset.b = sliders[2],
        )

        switch (mode) {
            case "RGB":
                finalParent.dataset.r = sliders[0]
                finalParent.dataset.g = sliders[1]
                finalParent.dataset.b = sliders[2]
                finalParent.dataset.a = sliders[3]
                break
        }
    }

    #updateTarget(e) {
        if (!this.target) return
        switch (this.target.tagName) {
            case "COLORPICKER-HUEWHEELMOUSE":
                this.activeSelector = this.target
                this.#hueSatChange(e, this)
                break
            case "COLORPICKER-BRIGHTNESS":
                this.activeSelector = this.target
                this.#brightnessChange(e, this)
                break
            case "COLORMODE-BUTTON":
                this.#switchColorMode(this)
                break
        }
    }
    #makeColorModeButtonObjects(switchColorMode) {
        return ([{ m: "RGB", s: true }, { m: "HSV", s: false }, { m: "HEX", s: false }]).map(a => {
            return {
                tagname: "colormode-button",
                innerText: a.m,
                dataset: { selected: a.s, mode: a.m },
                eventListener: {
                    mousedown: (e) => {
                        this.target = e.target;
                    }
                }
            }
        })
    }

}




function valueChangeParamGrab(activeSelector, e) {
    const { x, y, width, height } = activeSelector.getBoundingClientRect();
    const { clientX, clientY } = e;

    return {
        padding: parseInt(window.getComputedStyle(activeSelector, null).getPropertyValue('padding')),
        width: width,
        height: height,
        dX: clientX - x,
        dY: clientY - y
    }
}



export { Wheel }
