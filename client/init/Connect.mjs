
import { openLoginDialog, setupAuthListeners } from "./init.js";
import { SocketManager } from "./SocketManager.mjs";

export const Socket = new SocketManager(document.location);

Socket.connectionOpened(() => {
  Socket.registerModule("Auth");
  setupAuthListeners(Socket);
  if (document.cookie) {
    Socket.Auth.send("cookieLogin", document.cookie);
  } else {
    openLoginDialog();
  }
});


export function Auth(action, data) {
  Socket.Auth.send(action, data)
}
export function System(action, data) {
  Socket.System.send(action, data)
}
export function User(action, data) {
  Socket.User.send(action, data)
}
export function App(action, data) {
  Socket.App.send(action, data)
}