"<import>"
import { create } from "/js/modules/Util.mjs";
import { Wheel, TextboxSlider, SliderGroup, DropDownMenu, TextDropDown } from "/js/modules/ui.mjs"
import { System } from "/js/modules/Connect.mjs";
import { addMessageListener } from "/js/modules/System.mjs"
import * as Client from "/js/modules/Client.mjs"
"</import>"
"<application>"

function handleMessages(data) {
    console.log(data)
}

addMessageListener(application.windowid, handleMessages)


application.body.querySelector("div.edit").addEventListener("click", () => {
    System( {req: "fetch_app", data: { id: "profile" }})
})

const usersettings = {}
const settingsTemplate = {
    home: {
        type: "HOME",
        icon: "home-alt-2",
        elements: []
    },
    profile: {
        type: "PAGE",
        icon: "user",
        elements: []
    },
    appearance: {
        type: "PAGE",
        icon: "",
        elements: [
            {id: "btn-settings-app-theme", label: "Themes", type: "OPEN", description: "", icon: ""},
            {id: "btn-settings-app-darkmode", label: "Darkmode", type: "SWCH", description: "", icon: ""},
            {id: "btn-settings-app-colors", label: "Colors", type: "OPEN"},
            {id: "spr-settings-app-images", label: "Images"},
            {id: "btn-settings-app-background", label: "Background", type: "OPEN", description: "", icon: ""},
            {id: "btn-settings-app-logo", label: "Logo", type: "FILE", description: "", icon: ""},
            {id: "spr-settings-app-ui", label: "UI"},
            {id: "btn-settings-app-taskbar", label: "Taskbar", type: "OPEN", description: "", icon: ""},
            {id: "btn-settings-app-UI", label: "UI", type: "OPEN", description: "", icon: ""},
        ]
    },
    language: {
        type: "PAGE",
        icon: "",
        elements: []
    },
    privacy: {
        type: "PAGE",
        icon: "",
        elements: []
    },
    social: {
        type: "PAGE",
        icon: "",
        elements: []
    },

}

const main = application.body.querySelector("div.right");
const test = main.querySelector("div.test");
// const wheel = new Wheel(test)
// // makeColorSelector(test)
// wheel.show()

// const tbSlide1 = new TextboxSlider({min: 0, max: 255, step: 1, val: 1, label: "R"})
// tbSlide1.setStyle({
//     width: "300px"
// })
// tbSlide1.setTextOffset("24px")

// const tbSlide2 = new TextboxSlider({min: 0, max: 255, step: 1, val: 1, label: "G"})
// tbSlide2.setStyle({
//     width: "300px",
//     "box-sizing": "border-box"
// })
// tbSlide2.setTextOffset("24px")

// const tbSlide3 = new TextboxSlider({min: 0, max: 255, step: 1, val: 1, label: "B"})
// tbSlide3.setStyle({
//     width: "300px"
// })
// tbSlide3.setTextOffset("24px")



// const slidegroup = create({
//     tagname: "slider-group",
//     childElements: [
//         tbSlide1.element, tbSlide2.element, tbSlide3.element
//     ]
// })

// tbSlide3.element.addEventListener("update", (e)=>{

// })

// const tbSlide4 = new TextboxSlider({min: 0, max: 255, step: 1, val: 1, label: "A"})
// tbSlide4.setTextOffset("24px")
// tbSlide4.setStyle({
//     width: "300px",
//     "margin-top": "6px"
// })

// const newSlideGroup = new SliderGroup([
//     {min: 0, max: 255, step: 1, val: 1, label: "A"},
//     {min: 0, max: 255, step: 1, val: 1, label: "B"},
//     {min: 0, max: 255, step: 1, val: 1, label: "C"},
//     {min: 0, max: 255, step: 1, val: 1, label: "D"},
// ], "label")

// newSlideGroup.setStyle("width: 300px; margin-top: 12px;")
// newSlideGroup.element.addEventListener("update", (e) => {
//     // console.log(e.target)
//     })
//     newSlideGroup.element.addEventListener("set", (e) => {
//         console.log("set", e.target.values)
//         })

const testDropdown = new DropDownMenu([
    {
        label: "Option 1",
        handler: (e) => {
            console.log("option 1");
        }
    },
    {
        label: "Option 2",
        handler: (e) => {
            console.log("option 2");
        }
    },
    {
        label: "Option 3",
        handler: (e) => {
            console.log("option 3");
        }
    },
    {
        label: "Option 4",
        handler: (e) => {
            console.log("option 4");
        }
    },
])
const testDropdown1 = new DropDownMenu([
    {
        label: "Option 1",
        handler: (e) => {
            console.log("option 1");
        }
    },
    {
        label: "Option 2",
        handler: (e) => {
            console.log("option 2");
        }
    }
])

const testTextDropdown = new TextDropDown([
    "aaa",
    "aab",
    "abv",
    "afgsd",
    "ets",
    "fgds"
])

const screens = { // Array of DOM trees
    "home": [
        create({
            tagname: "span",
            innerText: "Home",
            classList: ["settings-header"]
        }),
        create({
            tagname: "span",
            innerText: "divider/subheader",
            classList: ["settings-subcategory"]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "button"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Test button"
                },
                {
                    tagname: "i",
                    classList: ["bx", "bx-chevron-right", "bx-sm"]
                }
            ]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Test color picker with alpha (to do: alpha slider)"
                },
                {
                    tagname: "color-picker",
                    id: "test",
                    dataset: {
                        r: 0, g: 0, b: 0, a: 1
                    },
                    eventListener: {
                        click: ({target}) => {const wheel = new Wheel(target); wheel.show()}
                    }
                }
            ]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Test drop down"
                },
                testDropdown.element
            ]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Test Text drop down"
                },
                testTextDropdown.element
            ]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Test drop down2"
                },
                testDropdown1.element
            ]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Test toggle"
                },
                {
                    tagname: "toggle-switch",
                    dataset: {value: "true"},
                    eventListener: {
                        click: (e) => {e.target.dataset.value = e.target.dataset.value=="false"}
                    }
                }
            ]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Test toggle2"
                },
                {
                    tagname: "toggle-switch",
                    dataset: {value: "false"},
                    eventListener: {
                        click: (e) => {e.target.dataset.value = e.target.dataset.value=="false"}
                    }
                }
            ]
        }),
        // slidegroup,
        // tbSlide4.element,
        // newSlideGroup.element
    ],
    "user": [
        create({
            tagname: "span",
            innerText: "User",
            classList: ["settings-header"]
        })
    ],
    "pckg": [
        create({
            tagname: "span",
            innerText: "Applications",
            classList: ["settings-header"]
        })
    ],
    "appr": [
        create({
            tagname: "span",
            innerText: "Appearance",
            classList: ["settings-header"]
        }),
        create({
            tagname: "span",
            innerText: "Taskbar",
            classList: ["settings-subcategory"]
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            childElements: [
                {
                    tagname: "span",
                    classList: ["text"],
                    innerText: "Floating"
                },
                {
                    tagname: "toggle-switch",
                    dataset: {value: "true"},
                    eventListener: {
                        click: (e) => {
                            e.target.dataset.value = e.target.dataset.value=="false";
                            document.querySelector("task-bar").style = e.target.dataset.value=="false"?"bottom: 0; border-radius: 6px 6px 0 0":"";
                        }
                    }
                }
            ]
        }),

    ],
    "lang": [
        create({
            tagname: "span",
            innerText: "Language and Time",
            classList: ["settings-header"]
        })
    ],
    "prvc": [
        create({
            tagname: "span",
            innerText: "Privacy",
            classList: ["settings-header"]
        })
    ],
    "socl": [
        create({
            tagname: "span",
            innerText: "Social",
            classList: ["settings-header"]
        })
    ]
};


function getParentButton(target) {
    while(target.tagName != "DIV") target = target.parentNode;
    return target
}

sidebarButtonHandle()

const messagesButton = window.querySelector("div#messages.button");
const requestButton = window.querySelector("div#requests.button");



setInterval(() => {
    let messages = +messagesButton.dataset.amount
    if (messages > 99) {
        messagesButton.dataset.amountClean = "99+";
    } else {
        messagesButton.dataset.amountClean = messages
    }
}, 40);

function sidebarButtonHandle(e) {
    let s = ""
    if (!e) {
        s = "home"
    } else {
        s = getParentButton(e.target).dataset.target;
    }
    main.innerText = "";
    console.log(s)
    main.append(...screens[s])
    const colorPickers = Array.from(main.querySelectorAll("color-picker"));
    colorPickers.forEach(a => {
        a.style.background = `rgba(${a.dataset.r},${a.dataset.g},${a.dataset.b},${a.dataset.a })`
    });
}

const sidebarButtons = Array.from(application.body.querySelector("div#settings-sidebar-bottom").childNodes).filter(a => a.tagName === "DIV");

sidebarButtons.forEach(a => a.addEventListener("click", sidebarButtonHandle))
function listener(data) {
    switch (data.operation) {
        case "update":
            // needs to be smarter to allow partial overwrite
            usersettings = data;
            // update ui
            break;
        case "select":
            // update ui to select correct sub menu
    }

    
}

application.addListener(listener)
