"<import>"
import { registerListener as __regList } from "/js/modules/app.mjs";
import { create } from "/js/modules/Util.mjs";
import { makeColorSelector } from "/js/modules/ui.mjs"
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
makeColorSelector(test)

const screens = { // Array of DOM trees
    "home": [create({tagname: "toggle-switch"})],
    "user": [],
    "pckg": [],
    "appr": [],
    "lang": [],
    "prvc": [],
    "socl": []
};

function sidebarButtonHandle(e) {
    main.innerHTML = "";
    main.append(...screens[e.target.dataset.target])
}

const sidebarButtons = Array.from(application.body.querySelector("div#settings-sidebar-bottom").childNodes).filter(a => a.tagName === "DIV");

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

console.log(application)
application.addListener(listener)
