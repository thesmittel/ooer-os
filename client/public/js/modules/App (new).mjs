import { Window } from "./Window.mjs";
function makeWindow(data, sys, instance_id, app_id, icon) {
    const window = new Window(instance_id, app_id, data, icon, sys);
    // registerWindow(window);
    
}


class App {
    #id;
    worker = null;
    type;
    elements;
    #instance

    constructor(appid, instanceid, type, html, script, permission) {
        this.#id = appid;
        this.#instance = instanceid;
        this.type = type;
        if (script.length > 0) {
            let blob = new Blob([js], {type: permission==2?"module":"text/javascript"})
            const bloburl = new URL.createObjectURL(blob);
            this.worker = new Worker(bloburl);
        }

    } 
}