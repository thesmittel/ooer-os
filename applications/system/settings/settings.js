"<import>"
import { create } from "/js/modules/Util.mjs";
import { Wheel, TextboxSlider } from "/js/modules/ui.mjs"
"</import>"
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

const tbSlide = new TextboxSlider({min: 0, max: 100, step: 1, val: 30})
tbSlide.setStyle({
    width: "300px"
})
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
            innerHTML: `<span class="text">Test button</span><box-icon name='chevron-right' color="white"></box-icon>`
        }),
        create({
            tagname: "div",
            classList: ["settings-element", "regular"],
            innerHTML: `<span class="text">Test color picker</span><color-picker id="test" data-r="0" data-g="0" data-b="0" data-a="255"></div>`
        }),
        tbSlide.element,
    ],
    "user": [create({tagname: "toggle-switch"})],
    "pckg": [],
    "appr": [],
    "lang": [],
    "prvc": [],
    "socl": []
};

function getParentButton(target) {
    while(target.tagName != "DIV") target = target.parentNode;
    return target
}

sidebarButtonHandle()

function sidebarButtonHandle(e) {
    let s = ""
    if (!e) {
        s = "home"
    } else {
        getParentButton(e.target).dataset.target;
    }
    main.innerHTML = "";
    main.append(...screens[s])
    const colorPickers = Array.from(main.querySelectorAll("color-picker"));
    colorPickers.forEach(a => {
        a.addEventListener("click", ({target}) => {const wheel = new Wheel(target); wheel.show()});
        a.style.background = `rgba(${a.dataset.r},${a.dataset.g},${a.dataset.b},${a.dataset.a / 255})`
    });
}

const sidebarButtons = Array.from(application.body.querySelector("div#settings-sidebar-bottom").childNodes).filter(a => a.tagName === "DIV");

sidebarButtons[0].addEventListener("click", sidebarButtonHandle)

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
