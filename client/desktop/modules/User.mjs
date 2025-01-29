import { User } from "../../init/init.js";

// Holds all relevant user data, private or public
// Referenced by all other modules.
const data = {
  user: User, 
  desktopSymbols: undefined,
  widgets: undefined,
  windows: undefined,
  settings: undefined
}


export function setDesktopSymbols(obj) {
  data.desktopSymbols = obj
}
export function setWidgets(obj) {
  data.widgets = obj
}
export function setWindows(obj) {
  data.windows = obj
}
export function setSettings(obj) {
  data.settings = obj
}

export function isDone() {
  // Checks if all the data has arrived.
  
  let x = true;
  for (let i of data) {
    x *= (i !== undefined)
  }
  return x;
}