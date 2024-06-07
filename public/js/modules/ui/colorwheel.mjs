import { create, round, map, clamp, cartesianToPolar, polarToCartesian, radianToDegree, degreeToRadian } from "/js/modules/Util.mjs";
import { Color } from "/js/modules/colors.mjs";


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

    constructor(parentElement) {
        this.parentElement = parentElement;
    }


    brightnessChange(e, wheel) {
        if (!wheel.activeSelector || !wheel.mousedown) return;
        e.stopPropagation(); // dont know if this is needed tbh

        const { height, padding, dY } = valueChangeParamGrab(wheel.activeSelector, e)

        const relY = clamp(7 + padding, dY + 2 * padding, height + 2); // coordinates are top-to-bottom; relY is used as is for UI update

        const indicator = wheel.activeSelector.childNodes[0];
        indicator.style.top = relY + "px";

        const brightnessmask = wheel.activeSelector.parentNode.querySelector("colorpicker-huewheelbright")
        // const brightness = 1 - Math.round((relY - padding - 6) / (selector.height - padding - 6) * 10000) / 10000;     // This is what "normalises" relY to 0..1
        const brightness = map(relY, 7 + padding, height + 2, 100, 0)
        brightnessmask.style["backdrop-filter"] = `brightness(${brightness / 100})`
        wheel.activeSelector.parentNode.dataset.v = brightness
        wheel.changeSliders(wheel.activeSelector.parentNode);
    }

    hueSatChange(e, wheel) {
        if (!wheel.activeSelector || !wheel.mousedown) return;
        //e.stopPropagation(); // dont know if this is needed tbh
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

        wheel.activeSelector.parentNode.parentNode.dataset.h = round(radianToDegree(polar.a), 2)
        wheel.activeSelector.parentNode.parentNode.dataset.s = Math.round(polar.r / height * 10000) / 50
        wheel.changeSliders(wheel.activeSelector.parentNode.parentNode);
    }

    changeSliders(el) {
        const sliderContainer = el.querySelector("colorpicker-slidercontainer")
        const sliders = sliderContainer.querySelectorAll("color-slidetextbox")

        const hueWheelSelector = el.querySelector("colorpicker-wheel").childNodes[2]
        const newRgb = Color.hsv.toRgb(el.dataset)
        hueWheelSelector.style["background-color"] = `rgba(${newRgb.r},${newRgb.g},${newRgb.b},${this.sliderValues[3] / 100})`
        this.parentElement.dataset.r = newRgb.r;
        this.parentElement.dataset.g = newRgb.g;
        this.parentElement.dataset.b = newRgb.b;
        this.parentElement.style.background = `rgba(${newRgb.r},${newRgb.g},${newRgb.b},${this.sliderValues[3] / 100})`
        this.parentElement.dataset.a = this.sliderValues[3];

        switch (sliderContainer.dataset.colormode) {
            case "RGB": // fallthrough
            default:
                this.sliderValues = [round(newRgb.r / 255, 4), round(newRgb.g / 255, 4), round(newRgb.b / 255, 4), this.sliderValues[3]]
                this.visualSlider = [...this.sliderValues.map(a => a * 100)];
                break;
            case "HSV":
                this.sliderValues = [round(el.dataset.h, 2), round(el.dataset.s, 2), round(el.dataset.v, 2), this.sliderValues[3]]
                this.visualSlider = [map(this.sliderValues[0], 0, 360, 0, 100), this.sliderValues[1], this.sliderValues[2], this.sliderValues[3]]

                break
            case "HEX":
                const hexColor = Color.hsv.toHex(el.dataset)
                sliders[0].dataset.value = hexColor;
                sliders[0].childNodes[1].value = hexColor;
                return;
        }

        for (let i = 0; i < 3; i++) {
            this.#updateSlider(sliders[i], this.sliderValues[i], this.visualSlider[i])
        }
    }

    #updateSlider(slider, value, visual) {
        slider.dataset.value = value;
        slider.childNodes[1].value = value;
        slider.style = `background: var(--colorPickerSliderColor);
        background: -moz-linear-gradient(90deg, var(--colorPickerSliderColor) ${visual}%, var(--colorPickerSliderShadowColor) ${visual}%, var(--colorPickerSliderBackdrop) ${visual + 1}%);
        background: -webkit-gradient(90deg, var(--colorPickerSliderColor) ${visual}%, var(--colorPickerSliderShadowColor) ${visual}%, var(--colorPickerSliderBackdrop) ${visual + 1}%);
        background: linear-gradient(90deg, var(--colorPickerSliderColor) ${visual}%, var(--colorPickerSliderShadowColor) ${visual}%, var(--colorPickerSliderBackdrop) ${visual + 1}%);
        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#8b0000",endColorstr="#6d6d6d",GradientType=1);`
    }

    switchColorMode({ target }) {
        const buttons = Array.from(target.parentNode.querySelectorAll("colormode-button"))
        const sliders = Array.from(target.parentNode.querySelectorAll("color-slidetextbox"))
        const newColorMode = target.dataset.mode;
        target.parentNode.dataset.colormode = target.dataset.mode;
        if (newColorMode == "HEX") {
            for (let i = 1; i < 4; i++) {
                sliders[i].style.visibility = "hidden"
            }
            sliders[0].dataset.current = "HEX #";
            sliders[0].style.background = "none"
            sliders[0].style["background-color"] = "var(--colorPickerSliderBackdrop)";
            sliders[0].style["padding-left"] = "52px"
            const { h, s, v } = target.parentNode.parentNode.dataset;
            const newHex = Color.hsv.toHex({ h: h, s: s, v: v });
            sliders[0].innerText = newHex;
            // Change active
        } else if (newColorMode == "RGB" || newColorMode == "HSV") {
            sliders[0].style["padding-left"] = ""
            for (let i = 0; i < 3; i++) {
                sliders[i].dataset.current = newColorMode.charAt(i); // i dont like this 
                sliders[i].style.visibility = "visible"
            }
            sliders[3].style.visibility = "visible";

            this.changeSliders(target.parentNode.parentNode)
        }
        buttons.forEach(a => a.dataset.selected = false);
        target.dataset.selected = true;
        target.parentNode.dataset.colormode = target.dataset.mode;
    }

    mousemove(e) {
        if (this.mode && this.mousedown) {
            this.hueSatChange(e, this)
        } else {
            this.brightnessChange(e, this)
        }
    }

    pickerUpdate(e, func, el) {
        // this.closable = false;
        // this.activeSelector = e.target;
        // if (this.activeSelector.tagName == "COLORPICKER-INDICATOR") this.activeSelector = el;
        // this.mousedown = true;

        // const handle = [
        //     this.brightnessChange, this.hueSatChange
        // ]

        // handle[func](e, this);


    }

    resetClosable() {
        setTimeout(() => {
            this.closable = true;
            document.removeEventListener("mouseup", this.resetClosable)
        }, 1)
    }


    show() {
        // If provided element is not dom element, throw up in a tantrum bc what else is there to do
        if (!this.parentElement.tagName) {
            throw new TypeError("this.parentElement must be DOM Element, got " + typeof this.parentElement)
        }

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

        const colorpickerBright = create({
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

        const colorpickerWheel = create({
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

        const colorpickerSlideCont = create({
            tagname: "colorpicker-slidercontainer",
            dataset: {
                colormode: "RGB"
            },
            childElements: [
                ...this.makeColorModeButtonObjects(),
                ...this.#makeColorTextBoxSliders([r, g, b, a], ["R", "G", "B", "A"], this.sliderValues)
            ]
        })

        const colorpicker = create({
            tagname: "colorpicker-container",
            eventListener: {
                click: (e) => { e.stopPropagation() }
            },
            style: `top: ${y + height / 2}px; left: ${x + width}px; transform: translateY(-50%);`,
            eventListener: {
                mousedown: () => {
                    this.closable = false;
                    document.addEventListener("mouseup", this.resetClosable)
                }
            },
            childElements: [
                colorpickerBright,
                colorpickerWheel,
                colorpickerSlideCont
            ],
            dataset: { r: r, g: g, b: b, a: a, h: h, s: s, v: v }
        })

        const backdrop = create({
            tagname: "div",
            classList: ["colorwheel-backdrop"],
            eventListener: {
                click: (e) => {
                    // only removes the color picker if a color isnt actively being selected
                    // in other words: only clicking outside the selector removes it
                    e.stopPropagation()
                    if (this.closable && e.target.tagName == "DIV") e.target.remove()
                }
            },
            childElements: [colorpicker]
        })



        backdrop.addEventListener("mousedown", (e) => {
            if (e.target == backdrop) {
                backdrop.remove()
                return;
            }
            document.activeElement.blur();
            e.stopPropagation();
            e.preventDefault();
            // console.log(this.target)
            this.mousedown = true;
            this.closable = false;
            // if (!this.target || this.target.tagName == "DIV") return;
            this.updateTarget(e)
        })
        backdrop.addEventListener("mousemove", (e) => {
            this.updateTarget(e)
        })
        backdrop.addEventListener("mouseup", (e) => {
            this.resetClosable(e);
            this.mousedown = false;
            this.activeSelector = null
            this.target = null;
        })

        document.body.append(backdrop)

        const brightCompStyle = window.getComputedStyle(colorpickerBright, null);
        const brightPad = parseInt(brightCompStyle.getPropertyValue("padding"))
        const brightHeight = parseInt(brightCompStyle["height"])
        const brightTop = Math.min(135, Math.round(brightHeight - (v / 100 * brightHeight)) + brightPad + 7) + "px";

        const hueCompStyle = window.getComputedStyle(colorpickerWheel, null);
        const hueHeight = parseInt(hueCompStyle["height"])
        const hueSat = polarToCartesian({ a: degreeToRadian(h), r: s / 200 * hueHeight });
        const hueStyle = `top: ${Math.round(hueSat.y + 64)}px; left: ${Math.round(hueSat.x + 64)}px; background-color: rgba(${r}, ${g}, ${b}, 1)`

        colorpickerWheel.childNodes[1].style["backdrop-filter"] = `brightness(${v / 100})`

        colorpickerBright.childNodes[0].style.top = brightTop;
        colorpickerWheel.childNodes[2].style = hueStyle;

    }

    #makeColorTextBoxSliders(c, cn, sliderValues) {
        // const c = [r, g, b, a];
        // const cn = ["R", "G", "B", "A"]
        const ret = []
        for (let i in c) {
            ret.push({
                tagname: "color-slidetextbox",
                dataset: { value: c[i], index: i, current: cn[i], mode: "text", active: false },
                contentEditable: "true",
                childElements: [
                    {
                        tagname: "span",
                        classList: ["color-slidetextbox"],
                        innerText: cn[i]
                    },
                    {
                        tagname: "textarea",
                        classList: ["color-slidetextbox"],
                        rows: 1,
                        value: round(c[i] / 255, 4)
                    }
                ],
                style: `background: var(--colorPickerSliderColor);
                background: -moz-linear-gradient(90deg, var(--colorPickerSliderColor) ${sliderValues[i]}%, var(--colorPickerSliderShadowColor) ${sliderValues[i]}%, var(--colorPickerSliderBackdrop) ${sliderValues[i] + 1}%);
                background: -webkit-gradient(90deg, var(--colorPickerSliderColor) ${sliderValues[i]}%, var(--colorPickerSliderShadowColor) ${sliderValues[i]}%, var(--colorPickerSliderBackdrop) ${sliderValues[i] + 1}%);
                background: linear-gradient(90deg, var(--colorPickerSliderColor) ${sliderValues[i]}%, var(--colorPickerSliderShadowColor) ${sliderValues[i]}%, var(--colorPickerSliderBackdrop) ${sliderValues[i] + 1}%);
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#8b0000",endColorstr="#6d6d6d",GradientType=1);`,
                eventListener: {
                    mousedown: (e) => {

                        this.target = e.target;
                        if (e.target.tagName !== "COLOR-SLIDETEXTBOX") {
                            this.target = e.target.parentNode
                        }
                        this.target.dataset.active = "true"
                    },
                    mousemove: (e) => {
                        if (e.target.dataset.active == "true") {
                            e.target.dataset.mode = "slide"
                        }
                    },
                    mouseup: (e) => {
                        if (e.target.dataset.active == "true" && e.target.dataset.mode == "text") {
                            console.log("reached")
                            e.target.focus();
                            document.execCommand('selectAll', false, null)
                        }
                        this.target.dataset.active = "false";
                        this.target.dataset.mode = "text"
                    },
                    input: (e) => { this.#updateColorFromTextbox(e) }
                }
            })
        }
        return ret
    }

    #updateColorFromTextbox(e) {
        const type = e.inputType;
        const index = e.target.dataset.index;
        const data = e.data;
        const text = e.target.innerText;
        const colormode = e.target.parentNode.dataset.colormode
    }

    #updateColorFromSlider(e) {
        const colormode = this.target.parentNode.dataset.colormode;
        if (this.target.dataset.active == "true") {
            const { dX, width } = valueChangeParamGrab(this.target, e)
            let slider, visual;
            // console.log(dX, width, dX / width)
            let color;
            switch (colormode) {
                case "RGB":
                default:
                    visual = clamp(0, round(dX / width * 100, 2), 100);
                    slider = clamp(0, round(dX / width, 4), 1);
                    this.#updateDataset(this.target, "RGB");
                    break;
                case "HSV":
                    visual = clamp(0, round(dX / width * 100, 2), 100);
                    if (this.target.dataset.index == "0") { slider = clamp(0, map(visual, 0, 100, 0, 360), 360) }
                    else {
                        slider = clamp(0, round(dX / width * 100, 2), 100);
                    }
                    break;
            }

            this.#updateSlider(this.target, slider, visual)
        }
    }

    #updateDataset(target, mode) {
        console.log(target, mode)
        let sliders = Array.from(target.parentNode.querySelectorAll("textarea.color-slidetextbox")).map(a => Math.round(parseFloat(a.value) * 255));
        console.log(sliders[0], sliders[1], sliders[2], sliders[3])
        const finalParent = target.parentNode.parentNode;
        switch (mode) {
            case "RGB":
                finalParent.dataset.r = sliders[0]
                finalParent.dataset.g = sliders[1]
                finalParent.dataset.b = sliders[2]
                finalParent.dataset.a = sliders[3]
                break
        }
    }

    updateTarget(e) {
        if (!this.target) return
        switch (this.target.tagName) {
            case "COLORPICKER-HUEWHEELMOUSE":
                this.activeSelector = this.target
                this.hueSatChange(e, this)
                break
            case "COLORPICKER-BRIGHTNESS":
                this.activeSelector = this.target
                this.brightnessChange(e, this)
                break
            case "COLORMODE-BUTTON":
                this.switchColorMode(this)
                break
            case "COLOR-SLIDETEXTBOX":
                this.#updateColorFromSlider(e)
                break
        }
    }
    makeColorModeButtonObjects(switchColorMode) {
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