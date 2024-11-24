import { SocketRequest, SocketResponse } from "../../types.ts";
import { AssignedConnection, Connection, sessions, tokens } from "../index.ts";
import { Auth } from "../send.ts";
import { SocketManager } from "../SocketManager.ts";

export function handle(socket: WebSocket, data: SocketRequest) {
  switch (data.action) {
    case "login": {
      handleLogin(socket, data.data);
      break;
    }
    case "tokenLogin": {
      handleLoginWithToken(socket, data.data);
      break;
    }
    case "test": {
      console.log("Test received");
      Auth.return(socket, { "OMAN": "OMAN" });
      break;
    }
  }
}
type LoginInfo = {
  username: string;
  password: string;
};
function handleLogin(socket: WebSocket, data: LoginInfo): SocketResponse {
  console.log("handle login:", data);
  // grab salt and hashed password from DB
  // Hash provided password with salt
  // check
  const passwordCorrect: boolean = false;
  if (passwordCorrect) {
    Auth.confirmLogin(socket, {
      // Token, cookie data, desktop init data, maybe previous session
    });
    return {
      action: "confirmLogin",
      data: {},
    };
  }
  return {
    action: "login",
    data: {
      error: 2001,
      message: "Invalid Username or Password", // Will be granularised
    },
  };
}

function handleLoginWithToken(socket: WebSocket, data: any): SocketResponse {
  let valid: Connection[] = []; // maybe i had plans here, not sure
  // Get connection from object/database with given token registered
  if (tokens[data.token]) {
    Auth.confirmLogin(socket, {
      // Token, cookie data, desktop init data, maybe previous session
    });
  }
  return {
    action: "tokenLogin",
    data: {
      error: 2011,
      message: "Invalid Token",
    },
  };
}

export function setupAuthSocketHooks(sm: SocketManager) {
  sm.registerModule("Auth");
  sm.Auth.listen("login", handleLogin);
  sm.Auth.listen("tokenLogin", handleLoginWithToken);
  sm.Auth.listen("test", (): SocketResponse => {
    return {
      data: {OMAN: ":c"}
    };
    sm.Auth.send("return", { OMAN: "omAN" });
  });
}
