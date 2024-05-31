import { create, round, map, clamp, cartesianToPolar, polarToCartesian, radianToDegree, degreeToRadian } from "/js/modules/Util.mjs";
import { Color } from "/js/modules/colors.mjs";
let closable = true;
let activeSelector;


function makeColorSelector(parentElement) {
    // If provided element is not dom element, throw up in a tantrum bc what else is there to do
    if (!parentElement.tagName) {
        throw new TypeError("parentElement must be DOM Element, got " + typeof parentElement)
    }

    // just grabbing a bunch of parameters
    const {x, y, width, height} = parentElement.getBoundingClientRect();
    const {r,g,b,a} = parentElement.dataset;
    const {h,s,v} = Color.rgb.toHsv({r:r,g:g,b:b})

    // Initialises the sliders to the current value
    let sliderValues = [
        Math.round(r / 2.55),
        Math.round(g / 2.55),
        Math.round(b / 2.55),
        Math.round(a / 2.55)
    ]

    // carbon copy (no ref)
    let visualSlider = [...sliderValues]
    
    /**
     * Shorthand to avoid duplication. Grabs a number of necessary parameters from different Objects and serves them neatly to be deconstructed later
     * @param { HTMLDivElement } activeSelector 
     * @param { MouseEvent } e 
     * @local
     * @returns Object containing relevant parameters
     */
    function valueChangeParamGrab(activeSelector, e) {
        const {x,y,width,height} = activeSelector.getBoundingClientRect();
        const {clientX, clientY } = e;

        return {
            padding: parseInt(window.getComputedStyle(activeSelector, null).getPropertyValue('padding')),
            width: width,
            height: height,
            dX: clientX - x,
            dY: clientY - y
        }
    }

    // maybe brightnessChange and hueSatChange can be refactored
    function brightnessChange(e) {
        if (!activeSelector) return;
        e.stopPropagation(); // dont know if this is needed tbh

        const { height, padding, dY } = valueChangeParamGrab(activeSelector, e)

        const relY = clamp(7 + padding, dY, height + 1); // coordinates are top-to-bottom; relY is used as is for UI update
        
        const indicator = activeSelector.childNodes[0];
        indicator.style.top = relY + "px";
        // const brightness = 1 - Math.round((relY - padding - 6) / (selector.height - padding - 6) * 10000) / 10000;     // This is what "normalises" relY to 0..1
        const brightness = map(relY, 7 + padding, height + 1, 100, 0)
        activeSelector.parentNode.dataset.v = brightness
        changeSliders(activeSelector.parentNode);
    }

    function hueSatChange(e) {
        if (!activeSelector) return;
        e.stopPropagation(); // dont know if this is needed tbh

        const { width, height, dX, dY} = valueChangeParamGrab(activeSelector, e)

        const polar = cartesianToPolar({x: dX - width / 2, y: dY - height / 2});
        polar.r = clamp(0, polar.r, height / 2)
        
        const newCoords = polarToCartesian(polar)
        newCoords.x += width / 2;
        newCoords.y += height / 2;
        const indicator = activeSelector.parentNode.childNodes[1];

        indicator.style["background-color"] = `hsl(${Math.round(radianToDegree(polar.a))} 100% ${100 - Math.round(polar.r / height * 100)}%)`
        indicator.style.top = newCoords.y + "px";
        indicator.style.left = newCoords.x + "px";
        
        activeSelector.parentNode.parentNode.dataset.h = round(radianToDegree(polar.a), 2)
        activeSelector.parentNode.parentNode.dataset.s = Math.round(polar.r / height * 10000) / 50
        changeSliders(activeSelector.parentNode.parentNode);
    }

    function changeSliders(el) {
        const sliderContainer = el.querySelector("colorpicker-slidercontainer")
        const sliders = sliderContainer.querySelectorAll("color-slidetextbox")
        
        switch(sliderContainer.dataset.colormode) {
            case "RGB": // fallthrough
            default:
                const newRgb = Color.hsv.toRgb(el.dataset)
                sliderValues = [
                    round(newRgb.r / 255, 4),
                    round(newRgb.g / 255, 4),
                    round(newRgb.b / 255, 4),
                    sliderValues[3]
                ]
                visualSlider = [...sliderValues.map(a => a*100)];
                break;
            case "HSV":
                sliderValues = [
                    round(el.dataset.h, 2),
                    round(el.dataset.s, 2),
                    round(el.dataset.v, 2),
                    sliderValues[3]
                ]
                visualSlider = [
                    map(sliderValues[0], 0, 360, 0, 100),
                    sliderValues[1],
                    sliderValues[2]
                ]
                break
            case "HEX":
                const hexColor = Color.hsv.toHex(el.dataset)
                sliders[0].dataset.value = hexColor;
                sliders[0].innerText = hexColor;
                return;
        }
        
        for (let i = 0; i < 3; i++) {
            sliders[i].dataset.value = sliderValues[i];
            sliders[i].innerText = sliderValues[i];
            sliders[i].style = `background: var(--colorPickerSliderColor);
            background: -moz-linear-gradient(90deg, var(--colorPickerSliderColor) ${visualSlider[i]}%, var(--colorPickerSliderShadowColor) ${visualSlider[i]}%, var(--colorPickerSliderBackdrop) ${visualSlider[i] + 1}%);
            background: -webkit-gradient(90deg, var(--colorPickerSliderColor) ${visualSlider[i]}%, var(--colorPickerSliderShadowColor) ${visualSlider[i]}%, var(--colorPickerSliderBackdrop) ${visualSlider[i] + 1}%);
            background: linear-gradient(90deg, var(--colorPickerSliderColor) ${visualSlider[i]}%, var(--colorPickerSliderShadowColor) ${visualSlider[i]}%, var(--colorPickerSliderBackdrop) ${visualSlider[i] + 1}%);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#8b0000",endColorstr="#6d6d6d",GradientType=1);`
        }
    }
    function resetClosable() {
        setTimeout(() => {
            closable = true;
            document.removeEventListener("mouseup", resetClosable)
        }, 1)
    }

    function switchColorMode({target}) {
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
            const {h,s,v} = target.parentNode.parentNode.dataset;
            const newHex = Color.hsv.toHex({h:h,s:s,v:v});
            sliders[0].innerText = newHex;
            // Change active
        } else if (newColorMode == "RGB" || newColorMode == "HSV") {
            for (let i = 0; i < 3; i++) {
                sliders[i].dataset.current = newColorMode.charAt(i); // i dont like this 
                sliders[i].style.visibility = "visible"
            }
            sliders[3].style.visibility = "visible";

            changeSliders(target.parentNode.parentNode)
        }
        buttons.forEach(a => a.dataset.selected = false);
        target.dataset.selected = true;
        target.parentNode.dataset.colormode = target.dataset.mode;
    }

    // Shorthand to avoid code duplication
    /**
     * Avoids code duplication.
     * Prevents color wheel from being accidentally closed, calls the necessary UI updates.
     * Needs to be passed all arguments since the exact process is slightly different
     * @param { MouseEvent } e 
     * @param { Function } func Handles the UI update itself
     * @param { HTMLDivElement } el The element to act upon instead of the colorpicker-indicator
     */
    function pickerUpdate(e, func, el) {
        closable = false;
        activeSelector = e.target;
        if (activeSelector.tagName == "COLORPICKER-INDICATOR") activeSelector = el;
        func(e);
        document.addEventListener("mousemove", func);
        document.addEventListener("mouseup", (e) => {
            resetClosable(e);
            document.removeEventListener("mousemove", func),
            activeSelector = null
        })
    }

    const colorpickerBright = create({
        tagname: "colorpicker-brightness",
        eventListener: {
            mousedown: (e) => {
                pickerUpdate(e, brightnessChange, e.target.parentNode)
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
                tagname: "colorpicker-saturation",
                eventListener: {
                    mousedown: (e) => {
                        pickerUpdate(e, hueSatChange, e.target.parentNode.childNodes[0])
                    }
                }
            },
            {
                tagname: "colorpicker-indicator"
            }
        ]
    })
    
    function makeColorModeButtonObjects() {
        return ([{m: "RGB", s: true},{m: "HSV", s: false},{m: "HEX", s: false}]).map(a => {
            return {
                tagname: "colormode-button",
                innerText: a.m,
                dataset: {selected: a.s, mode: a.m},
                eventListener: {click: switchColorMode}
            }
        })
    }

    function makeColorTextBoxSliders(r,g,b,a) {
        const c = [r,g,b,a];
        const cn = ["R","G","B","A"]
        const ret = []
        for (let i in c) {
            ret.push({
                tagname: "color-slidetextbox",
                dataset: {value: c[i], index: i, current: cn[i]},
                contenteditable: true,
                innerText: round(c[i] / 255, 4),
                style: `background: var(--colorPickerSliderColor);
                background: -moz-linear-gradient(90deg, var(--colorPickerSliderColor) ${sliderValues[i]}%, var(--colorPickerSliderShadowColor) ${sliderValues[i]}%, var(--colorPickerSliderBackdrop) ${sliderValues[i] + 1}%);
                background: -webkit-gradient(90deg, var(--colorPickerSliderColor) ${sliderValues[i]}%, var(--colorPickerSliderShadowColor) ${sliderValues[i]}%, var(--colorPickerSliderBackdrop) ${sliderValues[i] + 1}%);
                background: linear-gradient(90deg, var(--colorPickerSliderColor) ${sliderValues[i]}%, var(--colorPickerSliderShadowColor) ${sliderValues[i]}%, var(--colorPickerSliderBackdrop) ${sliderValues[i] + 1}%);
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#8b0000",endColorstr="#6d6d6d",GradientType=1);`,
                
            })
        }
        return ret
    }
    const colorpickerSlideCont = create( {
        tagname: "colorpicker-slidercontainer",
        dataset: {
            colormode: "RGB"
        },
        childElements: [
            ...makeColorModeButtonObjects(),
            ...makeColorTextBoxSliders(r,g,b,a)
        ]
    })

    const colorpicker = create({
        tagname: "colorpicker-container",
        eventListener: {
            click: (e) => {e.stopPropagation()}
        },
        style: `top: ${y + height / 2}px; left: ${x + width}px; transform: translateY(-50%);`,
        eventListener: {
            mousedown: () => { 
                closable = false;
                document.addEventListener("mouseup", resetClosable)
             }
        },
        childElements: [
            colorpickerBright,
            colorpickerWheel,
            colorpickerSlideCont
        ],
        dataset: {r:r,g:g,b:b,a:a,h:h,s:s,v:v}
    })

    const backdrop = create({
        tagname: "div",
        classList: ["colorwheel-backdrop"],
        eventListener: {
            click: (e) => { 
                // only removes the color picker if a color isnt actively being selected
                // in other words: only clicking outside the selector removes it
                e.stopPropagation()
                if (closable && e.target.tagName == "DIV") e.target.remove()
            } 
        },
        childElements: [colorpicker]
    })
    document.body.append(backdrop)

    const brightCompStyle = window.getComputedStyle(colorpickerBright, null);
    const brightPad = parseInt(brightCompStyle.getPropertyValue("padding"))
    const brightHeight = parseInt(brightCompStyle["height"])
    const brightTop = Math.round(brightHeight - (v / 100 * brightHeight)) + brightPad + "px";

    const hueCompStyle = window.getComputedStyle(colorpickerWheel, null);
    const hueHeight = parseInt(hueCompStyle["height"])
    const hueSat = polarToCartesian({a: degreeToRadian(h), r: s / 200 * hueHeight});
    const hueStyle = `top: ${Math.round(hueSat.y + 64)}px; left: ${Math.round(hueSat.x + 64)}px; background-color: rgba(${r}, ${g}, ${b}, 1)`
    
    colorpickerBright.childNodes[0].style.top = brightTop;
    colorpickerWheel.childNodes[1].style = hueStyle;

}


export {makeColorSelector}