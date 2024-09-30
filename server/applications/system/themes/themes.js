"<import>"
import { create } from "/js/modules/Util.mjs";
import { Wheel, TextboxSlider, SliderGroup, DropDownMenu, TextDropDown, Button } from "/js/components/ui.mjs"
import { App, System } from "/js/modules/Connect.mjs";
import { addMessageListener } from "/js/modules/connect/System.mjs"
import * as Client from "/js/modules/connect/Client.mjs"
"</import>"
"<application>"

function handleMessages(data) {
    console.log(data)
}

addMessageListener(application.windowid, handleMessages)


application.addListener(listener)
