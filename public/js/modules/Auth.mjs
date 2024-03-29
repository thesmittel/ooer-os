import { Auth as emit, System } from "./Connect.mjs"
import { openSignup, openLogin, openSettings } from "../Handlers.mjs"
import { create } from "./Util.mjs"
import {handlers} from "../Error.mjs"



let login = {}

/**
 * Called on load, checks if a session identification cookie is present, if so, it automatically logs in
 */
function cookieLogin() {
    if (document.cookie.length > 0) {
        emit({req: "cookielogin", data: document.cookie})
    } else {
        loggedout();
    }

    
}


/**
 * Entrypoint for all Auth related data coming from the server.
 * @param {Object} data 
 */
function handle(data) {
    if (data.error) {
        handlers[data.error.code](data);
        return;
    }
    if (data.response == "confirm-login") {
        if (document.querySelector("login-main"))
            document.querySelector("login-main").remove()
        loggedin(data.data);
    }
    if (data.response == "confirm-cookielogin") {
        loggedin(data.data);
    }
    if (data.response == "confirm-usernameAvailable") {
        usernameAvailable()
    }
    if (data.response == "confirm-emailAvailable") {
        emailAvailable()
    }
    if (data.response == "confirm-legalemail") {
        validEmail()
    }
    if (data.response == "confirm-signup") {
        emit({
            req: "login", 
            data: {
                username: data.data.username,
                password: data.data.password
            }
        })
    }
}



/**
 * Removes the error message for invalid email in signup
 */
function validEmail() {
    const signup = document.querySelector("div#signup-container");
    signup.querySelector("div#signup-username-div").dataset.erroremail = "None"
}

/**
 * Removes the error message for unavailable username in signup
 */
function usernameAvailable() {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.errorusername = "None";
}



function emailAvailable() {
    // console.log("email avb")
    const signup = document.querySelector("div#signup-container");
    signup.dataset.erroremail = "None";
}
 

/**
 * Logs out by deleting session cookie and sending a logout request to server, calls function that resets interface
 * @param {Event} event 
 */
function userLogOut(event) {
    event.stopPropagation();
	emit({req: "logout", data: document.cookie})
	const cookies = document.cookie.split(";");

	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i];
		const eqPos = cookie.indexOf("=");
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
	}
	
    loggedout();
	login = {}
	
}

/**
 * Server response: successful login. Changes appearance of start menu
 * @param {Object} data 
 */
function loggedin(data) {
    // console.log(data)
    let expire = new Date(data.expires).toUTCString()
    // console.log(new Date(Date.now()).toUTCString(), expire)
    const smtopbar =  document.querySelector("div#sm-topbar")
    smtopbar.dataset.login = "true"
    document.cookie = `userid=${data["user-id"]};expires=${expire};SameSite=Strict;secure`
	document.cookie = `token=${data.token};expires=${expire};SameSite=Strict;secure` 
	login = {id: data.id, token: data.token, expires: data.expires};
    smtopbar.innerHTML = "";

    let userpfp = data.cache.avatar?`/media/images?i=${data.cache.avatar}`:`/media/images?i=default.jpg`;

    smtopbar.append(
        create({
            tagname: "a",
            classList: ["settingsbutton"],
            dataset: {ignore: "startmenu"},
            eventListener: {click: openSettings},
            childElements: [
                {
                    tagname: "i",
                    classList: ["fa-solid","fa-gear", "fa-lg"],
                    dataset: {ignore: "startmenu"}
                }
            ]
        }),
        create({
            dataset: {ignore: "startmenu"},tagname: "div"}),
        create({
            tagname:"div",
            classList: ["centerelement"],
            dataset: {ignore: "startmenu"},
            childElements: [
                {
                    tagname: "div",
                    classList: ["user-container"],
                    childElements: [
                        {
                            tagname: "div",
                            classList: ["nickname"],
                            innerText: data.cache.nickname || data.cache.username
                        },
                        {
                            tagname: "div",
                            classList: ["username"],
                            innerText: data.cache.username
                        }
                    ]
                },
                {
                    tagname: "div",
                    classList: ["userpfp"],
                    style: `background-image: url("${userpfp}");`
                        
                    
                }
            ]
        }),
        create({
            tagname: "a",
            classList: ["settingsbutton"],
            eventListener: {click: userLogOut},
            dataset: {ignore: "startmenu"},
            childElements: [{
                tagname: "i", 
                dataset: {ignore: "startmenu"},
                classList: ["fa-solid", "fa-arrow-right-from-bracket", "fa-lg"]
            }]
        })
    )

}

/**
 * When user logs out, deletes desktop symbols as well as changing the start menu to the "logged out" state
 * @todo remove desktop symbols, close windows
 */
function loggedout() {
    const smtopbar =  document.querySelector("div#sm-topbar")
    smtopbar.dataset.login = "false";
    smtopbar.dataset.ignore = "startmenu"
    smtopbar.innerHTML = "";
    smtopbar.append(
        create({tagname: "div", dataset: {ignore: "startmenu"}}),
        create({
            tagname: "input",
            type: "button",
            id: "signup",
            value: "Sign up",
            dataset: {ignore: "startmenu"},
            eventListener: {click: openSignup}
        }),
        create({
            tagname: "input",
            type: "button",
            id: "login",
            value: "Log in",
            dataset: {ignore: "startmenu"},
            eventListener: {click: openLogin}
        })
    )
    document.querySelectorAll("desktop-symbol").forEach(a => a.remove())
    document.querySelectorAll("div.window").forEach(a => a.remove())
}

export {handle, cookieLogin}


