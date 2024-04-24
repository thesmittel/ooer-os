"<import>"
import { application } from "express";
import { registerListener as __regList } from "/js/modules/app.mjs";
"</import>"
const usersettings = {}
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
application.window = "test"
console.log(application)
registerListener(`${application.app}-${application.instance}-${application.window}`, listener)
