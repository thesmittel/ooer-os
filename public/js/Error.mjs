/**
 * Served to client on page load. Handles Errors and Dialogs
 * @file Error.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:Error
 * @see <a href="./client.Client_Error.html">Module</a>
 */
/**
 * Served to client on page load. Handles Errors and Dialogs
 * @file Error.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:Error
 * @see <a href="./client.Client_Error.html">Module</a>
 * @namespace ClientCode
 */
/**
 * @module Error
 * @memberof client
 * @description Error.mjs parses error codes returned from the server as well as generating error messages
 * @name Client:Error
 * @author Smittel
 */

import { create } from "./modules/Util.mjs";

function invalidCredentials(message) {
    let cont = document.querySelector("div#login-container")
    console.log(cont)
    if (!cont) return;
    cont.dataset.error = message.message;
}

function emailTaken({ code, message }) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.erroremail = code;
    signup.querySelector("div#signup-email-div").dataset.erroremail = message
}

function usernameTaken({ code, message }) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.errorusername = code;
    signup.querySelector("div#signup-username-div").dataset.errorusername = message
}

function passwordsDontMatch({ code, message }) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.errorpassword = code
    signup.querySelector("div#signup-password-div").dataset.errorpassword = message
}

function criteriaNotMet(data) {
    const signup = document.querySelector("div#signup-container");
    signup.querySelector("#password-hint").dataset.visible = true;
}

function invalidEmail({ code, message }) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.erroremail = code
    signup.querySelector("div#signup-email-div").dataset.erroremail = message
}

function passwordRequired({ code, message }) {
    setTimeout(() => {
        const signup = document.querySelector("div#signup-container");
        signup.dataset.errorpassword = code
        signup.querySelector("div#signup-password-div").dataset.errorpassword = message
    }, 1);

}

function invalidUsername({ code, message }) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.errorusername = code
    signup.querySelector("div#signup-username-div").dataset.errorusername = message
}

function connectionTimedOut(data) {
    // Display error message
}


function errorDialog({ title, description, type, buttons, blocked, parent }) {
    /*
    {
        title: String,
        description: String, 
        type: Number, |INFO:0, QUESTION:1, WARN:2, CRITICAL:3|
        buttons: [
            {
                text: "Button Text",
                call: function,
                main: boolean, |determines style of button|
            }
        ],
        blocked: bool, |Application blocked?|
        parent: DOMElement |Where does the error belong?|
    }
    */
    const symbols = [
        `<i class="fa-solid fa-circle-info fa-xl"></i>`,
        `<i class="fa-regular fa-circle-question fa-xl"></i>`,
        `<i class="fa-solid fa-triangle-exclamation fa-xl"></i>`,
        `<i class="fa-solid fa-circle-xmark fa-xl"></i>`
    ]
    const symbolColors = ["#28f", "#82c", "#eb3", "#e31"];
    function makeButtons(a) {
        const b = {
            tagname: "error-button",
            innerHTML: a.text,
            eventListener: {"click": a.call},
            dataset: {main: a.main == true}
        }
        return b;
    }
    const error = create({
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
                        innerHTML: symbols[type],
                        style: `color: ${symbolColors[type]}`
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
                        childElements: buttons.map(makeButtons)
                    }
                ]
            }
        ]
    })
    parent.append(error)
}


const handlers = {
    "A-0001": invalidCredentials,
    "A-0002": invalidCredentials,
    "A-0003": usernameTaken,
    "A-0004": emailTaken,
    "A-0005": criteriaNotMet,
    "A-0006": passwordsDontMatch,
    "A-0007": passwordRequired,
    "A-0008": invalidEmail,
    "A-0009": invalidUsername,
    "S-0001": connectionTimedOut
}

export { handlers, errorDialog }