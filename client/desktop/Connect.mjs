import {
  cookieLogin,
  handle as auth,
  openLoginDialog,
} from "./connect/Auth.mjs";
import { SocketManager } from "../init/SocketManager.mjs";
import { create } from "./Util.mjs";
import { Socket } from "../init/Connect.mjs";

console.log(" K  hhjhj ", Socket)
Socket.connectionOpened(() => {
  console.log("open");
  Socket.registerModule("Auth");
  setupAuthListeners();
  if (document.cookie != "") {
    cookieLogin();
  } else {
    openLoginDialog();
  }
});

Socket.connectionClosed(() => {
  console.log("CONNECTION CLOSED!");
});

Socket.error(() => {
  console.log("error");
});

function setupAuthListeners() {
  Socket.Auth.listen("confirmLogin", (d) => {
    Socket.registerModule("User");
    Socket.registerModule("App");
    Socket.registerModule("System");
    // document.getElementById("scriptEntrypoint").remove();
    
    document.head.append(
      create({
        tagname: "script",
        src: "/js/main.js",
        type: "module",
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/desktop.css"
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/window.css"
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/ui.css"
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/de.css"
      })
    );
    console.log(d);
  });
  Socket.Auth.listen("error", (d) => {
    console.log(d);
  });
}

export function Auth(action, data) {
  Socket.Auth.send(action, data);
}

export function System(action, data) {
  Socket.System.send(action, data);
}

export function User(action, data) {
  Socket.User.send(action, data);
}

export function App(action, data) {
  Socket.App.send(action, data);
}
