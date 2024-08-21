import { create } from "../Util.mjs";

class DialogBox {
    title;
    description;
    type;
    element;
    #buttons;
    #parent;
    #blocked;
    #symbolColors = ["#28f", "#82c", "#eb3", "#e31"];
    #symbols = [
        "<box-icon color='#37f' size='lg' name='alarm-exclamation'></box-icon>", // Alarm, Clock, Timer
        "<box-icon name='info-circle' size='lg' color='#5ae'></box-icon>", // Info
        "<box-icon name='help-circle'size='lg'color='#3ae'></box-icon>", // Question
        "<box-icon name='error' size='lg' color='#ec2'></box-icon>", // Exclamation
        "<box-icon color='#ea1425' size='lg' name='x-circle'></box-icon>" // Error (Critical)
    
    ]
    #makeButton(a) {
        const b = {
            tagname: "error-button",
            innerHTML: a.text,
            eventListener: {"click": a.call},
            dataset: {main: a.main == true}
        }
        return b;
    }
    close() {
        this.element.remove();
    }
    constructor(title, description, type, buttons, parent, blocked) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.#blocked =  blocked;
        this.#buttons = buttons;
        this.#parent = parent;

        this.element = create({
            tagname: "error-box",
            dataset: {
                title: title
            },
            childElements: [
                {
                    tagname: "div",
                    classList: ["container"],
                    childElements: [
                        {
                            tagname: "div",
                            classList: ["error-icon"],
                            innerHTML: this.#symbols[type],
                            style: `color: ${this.#symbolColors[type]}`
                        },
                        {
                            tagname: "div",
                            classList: ["error-description"],
                            childElements: [
                                {
                                    tagname: "pre",
                                    innerHTML: description
                                }
                            ]
                        },
                        {
                            tagname: "div",
                            classList: ["error-buttons"],
                            childElements: buttons.map(this.#makeButton)
                        }
                    ]
                }
            ]
        })
        parent.append(this.element)
    }
}

export { DialogBox }