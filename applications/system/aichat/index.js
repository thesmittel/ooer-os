"<import>"
import { create, clamp } from "./js/modules/Util.mjs";
import { System } from "./js/modules/Connect.mjs";
"</import>"

document.querySelectorAll('.grow-wrap').forEach(wrap => {
    wrap.setAttribute('data-replicated-value', wrap.querySelector('textarea').value);
  });

const modelListDiv = body.querySelector("#model-list")
const convoListDiv = body.querySelector("#convo-list")
const cvlistinner = convoListDiv.querySelector(".convo-list-inner")
const mdlcontainer = modelListDiv.querySelector("#model-list-container")
const main = body.querySelector(".container")
const input = body.querySelector("textarea#text")
const conversation = main.querySelector("div#conversation")
let bubbles = body.querySelector("div.bubbles");
const send = body.querySelector("a#send");
const textbox = body.querySelector("textarea#text")

function toggleSideMenu(e) {
    e.stopPropagation();
    if (e.target.id == "convo-list" && modelListDiv.dataset.active == "true") {
        modelListDiv.dataset.active = "false";
        return
    }
    e.target.dataset.active = e.target.dataset.active == "false"
}

function toggleSideMenuViaChild(e) {
    e.target.parentNode.dataset.active = e.target.parentNode.dataset.active == "false"
}

main.addEventListener("mousedown", () => {
    modelListDiv.dataset.active = false;
    convoListDiv.dataset.active = false;
})
modelListDiv.addEventListener("mousedown", toggleSideMenu);
convoListDiv.addEventListener("mousedown", toggleSideMenu);
cvlistinner.addEventListener("mousedown", toggleSideMenuViaChild);
mdlcontainer.addEventListener("mousedown", toggleSideMenuViaChild);

input.addEventListener("keydown", valueChanged)
input.addEventListener("keydown", shiftDown)
input.addEventListener("keyup", shiftUp)

let shiftPressed = false;
function shiftDown(event) {
    if (!shiftPressed && event.key == "Shift") {
        console.log(event)
        shiftPressed = true;
    } 
}

function shiftUp(event) {
    if (shiftPressed && event.key == "Shift") {
        console.log(event)
        shiftPressed = false;
    }
}



function valueChanged(e) {
    if (e.key == "Enter" && !shiftPressed) {
        send.dispatchEvent(new Event('click', {
            bubbles: true,
            cancelable: true
          }));
          e.preventDefault()
    }
    setTimeout(() => { // I HATE THIS I HATE THIS I HATE THIS
        // But keydown has a delay :/
        let wrap = e.target.parentNode;
        let offset = parseInt(getComputedStyle(wrap).height);
        bubbles.style.bottom = offset + 12 + "px";
        bubbles.style.height = `calc(100% - ${offset + 12}px)`;
        bubbles.scrollTo(0, bubbles.scrollHeight)
    }, 1)
}

send.addEventListener("click", () => {
    if (input.value.trim()) {
        makeBubble({from: "human", content: input.value.replaceAll(/\r?\n/g, "<br>")})
        input.value = ""
    }
    input.dispatchEvent(new Event('input', {
        bubbles: true,
        cancelable: true
      }));
    // TO DO: send to server
})


System({req: "sysapp", data: {
    appid: "aichat",
    command: "init"
}})


export default function aiChatHandle(data) {
    // data.command
    switch (data.command) {
        case init:
            initialise(data);
    }
}
const data = {
    models: [
        {name: "test1"},
        {name: "test2"}
    ],
    messages: [
        {from: "ai", content: "1============================"},
        {from: "human", content: "2"},
        {from: "ai", content: "3"},
        {from: "human", content: " 4"},
        {from: "human", content: "5"},
        {from: "ai", content: "6"},
        {from: "ai", content: "7"},
        {from: "human", content: "8=========dshgiusd gdsiugsdiug uszguzag regfzua gd ag uzdsgfu gafougfuz egu zagfuzfgzu sebgvc fvzu ewsda vbgfuzv================="},
        {from: "ai", content: "9"},
        {from: "human", content: " 10"},
        {from: "human", content: "11"},
        {from: "ai", content: " 12"},
        {from: "ai", content: "13"},
        {from: "human", content: "14"},
        {from: "ai", content: " 15"},
        {from: "ai", content: "16"},
        {from: "human", content: "17"}
    ]
}
initialise(data)

function initialise(data) {
    // data.models
    for (let c of data.models) {
        // c.name
        let btn = document.createElement("a");
        btn.classList.add("modelbutton");
        btn.innerHTML = c.name;
        btn.addEventListener("click", () => {changeActiveModel(c.name)})
        btn.dataset.active = false;
        mdlcontainer.append(btn)
    }


}
let index = 0;
const intvl = setInterval(() => {
    makeBubble(data.messages[index])
    index++;
    if (index == 17) clearInterval(intvl)
}, 100);

function makeBubble({from, content}) {
    const bubble = create({
        tagname: "div",
        classList: ["messageparent", from],
        childElements: [
            {
                tagname: "div",
                classList: ["message", from],
                innerHTML: content
            }
        ]
    })
    bubbles.append(bubble)
    bubbles.scrollTo(0, bubbles.scrollHeight)
}