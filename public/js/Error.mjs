function invalidCredentials(message) {
    let cont = document.querySelector("div#login-container")
    console.log(cont)
    if (!cont) return;
    cont.dataset.error = message.message;
}

function emailTaken({code, message}) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.erroremail = code;
    signup.querySelector("div#signup-email-div").dataset.erroremail = message
}

function usernameTaken({code, message}) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.errorusername = code;
    signup.querySelector("div#signup-username-div").dataset.errorusername = message
}

function passwordsDontMatch({code, message}) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.errorpassword = code
    signup.querySelector("div#signup-password-div").dataset.errorpassword = message
}

function criteriaNotMet(data) {
    const signup = document.querySelector("div#signup-container");
    signup.querySelector("#password-hint").dataset.visible = true;
}

function invalidEmail({code, message}) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.erroremail = code
    signup.querySelector("div#signup-email-div").dataset.erroremail = message
}

function passwordRequired({code, message}) {
    setTimeout(() => {
        const signup = document.querySelector("div#signup-container");
        signup.dataset.errorpassword = code
        signup.querySelector("div#signup-password-div").dataset.errorpassword = message
    }, 1);

}

function invalidUsername({code, message}) {
    const signup = document.querySelector("div#signup-container");
    signup.dataset.errorusername = code
    signup.querySelector("div#signup-username-div").dataset.errorusername = message
}

function connectionTimedOut(data) {
    // Display error message
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

export {handlers}