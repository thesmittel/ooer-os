type SocketRequest = {
  module: string;
  action: string;
  data: any;
};
type SocketResponse = {
  module: string;
  action: string;
  data: any;
}
export class SocketManager {
  [index: string]: any;
  #socket;
  #invalid = [
    ...Object.getOwnPropertyNames(this),
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(this)),
    "",
    undefined,
  ];
  constructor(socket: WebSocket) {
    this.#socket = socket;

    this.#socket.addEventListener("message", (e) => {
      this.#onMessage(e)
    })
  }

  connectionOpened(callback: Function) {
    this.#socket.addEventListener("open", (e) => {
      callback(e);
    });
  }

  connectionClosed(callback: Function) {
    this.#socket.addEventListener("close", (e) => {
      callback(e);
    });
  }

  error(callback: Function) {
    this.#socket.addEventListener("error", (e) => {
      callback(e);
    });
  }

  #emit(module: string, action: string, data: object) {
    this.#socket.send(JSON.stringify({
      module: module,
      action: action,
      data: data,
    }));
  }

  #onMessage({ data }: { data: string }) {
    const request: SocketRequest = JSON.parse(data);
    if (this.#invalid.includes(request.module)) {
      this.#emit(request.module, request.action, {
        error: 1001,
        message: `Invalid Module Name: ${request.module}`,
      });
    }

    if (this[request.module].listeners[request.action] == undefined) {
      this.#emit(request.module, request.action, {
        error: 1002,
        message:
          `Action "${request.action}" not defined for module "${request.module}"`,
      });
    }
    this[request.module].listeners[request.action](request.data);
  }

  registerModule(moduleName: string) {
    if (!moduleName) throw new ReferenceError("Socket.registerModule(name): Module name missing")
    moduleName = moduleName.trim();
    moduleName = moduleName.replace(/([^\s\w]+)/g, "");
    moduleName = moduleName.replace(/^(\d+)|/g, "");
    if (moduleName == "" || typeof moduleName !== "string") {
      throw new Error("Socket.registerModule(name): Invalid module name");
    }
    moduleName.matchAll(/(?:\s+)(.)/g).forEach((match) => {
      moduleName = moduleName.replace(match[0], match[1].toUpperCase());
    });
    if (this.#invalid.includes(moduleName) || moduleName.charAt(0) == "#") {
      throw new Error("Socket.registerModule(name): Invalid module name");
    }

    if (this[moduleName]) {
      throw new ReferenceError(
        `Socket.registerModule(name): Module ${moduleName} already registered!`,
      );
    }

    this[moduleName] = {
      listeners: {},
      send: (action: string, data: any) => {
        this.#send(moduleName, action, data);
      },
      listen: (action: string, func: Function) => {
        this.#listen(moduleName, action, func)
      }
    };
    Object.freeze(this[moduleName])
  }

  #listen(module: string, action: string, func: Function) {
    if (typeof action !== "string") {
      throw new TypeError(
        `Socket.${module}.on(action, func): Argument 'action' must be of type string!`,
      );
    }
    if (typeof func !== "function") {
      throw new TypeError(
        `Socket.${module}.on(action, func): Argument 'func' must be of type function!`,
      );
    }
    this[module].listeners[action] = func;
  }
  #send(module: string, action: string, data: any) {
    if (typeof action !== "string") {
      throw new TypeError(
        `Socket.${module}.send(action, func): Argument 'action' must be of type string!`,
      );
    }
    this.#emit(module, action, data);
  }
}
