import { CallbackList, SocketRequest, SocketResponse } from "../types.ts";


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
      this.#onMessage(e);
    });
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

  #onMessage({ data }: { data: string }) {
    const request: SocketRequest = JSON.parse(data);
    if (this.#invalid.includes(request.module) || this[request.module] == undefined) {
      this.#emit(request.module, request.action, {
        error: 1001,
        message: `Invalid Module Name: ${request.module}`,
      });
      return
    }

    if (this[request.module].listeners[request.action] == undefined) {
      this.#emit(request.module, request.action, {
        error: 1002,
        message:
          `Action "${request.action}" not defined for module "${request.module}"`,
      });
    }
    const response : SocketResponse|null = this[request.module].listeners[request.action](request.data);
    if (response === null) {return}
    console.log("response", response)
    this.#emit(response?.module || request.module, response?.action || request.action, response?.data || {error: 1, message: "No data"})
  }

  deleteModule(moduleName : string) {
    if (typeof moduleName !== "string") {
      throw new TypeError("SocketManager.deleteModule(name): name must be of type string")
    }
    moduleName = this.#cleanupString(moduleName)
    moduleName = this.#convertToCamelCase(moduleName)
    if (this.#invalid.includes(moduleName)) { 
      throw new ReferenceError(`SocketManager.deleteModule(name): Cannot delete ${moduleName}`)
    }
    delete this[moduleName]
  }
  #cleanupString(str : string) : string {
    str = str.trim();
    str = str.replace(/([^\s\w]+)/g, "");
    str = str.replace(/^(\d+)|/g, "");
    return str
  }

  #convertToCamelCase(str : string) : string {
    str.matchAll(/(?:\s+)(.)/g).forEach((match) => {
      str = str.replace(match[0], match[1].toUpperCase());
    });
    return str
  }

  registerModule(name: string | Array<string>) {
    if (!name) {
      throw new ReferenceError(
        "Socket.registerModule(name): Module name missing",
      );
    }
    if (name instanceof Array) {
      for (const i of name) {
        this.registerModule(i)
      }
      return
    }
    if (typeof name !== "string") {
      throw new TypeError(`Socket.registerModule(name): name must be String, got "${name}" of type ${typeof name}`)
    }

    let moduleName : string = name; // It threw errors when i used the parameter itself, it didnt realise that at this point, name couldnt be String[] anymore
    moduleName = this.#cleanupString(moduleName)
    moduleName = this.#convertToCamelCase(moduleName)

    if (moduleName == "") {
      throw new ReferenceError(`Socket.registerModule(name): Invalid module name ${moduleName}`);
    }
    if (this.#invalid.includes(moduleName) || moduleName.charAt(0) == "#") {
      throw new ReferenceError(`Socket.registerModule(name): Invalid module name ${moduleName}`);
    }

    if (this[moduleName]) {
      throw new ReferenceError(
        `Socket.registerModule(name): Module "${moduleName}" already registered!`,
      );
    }

    this[moduleName] = {
      listeners: {},
      send: (action: string, data: any) => {
        this.#send(moduleName, action, data);
      },
      delete: (action: string | string[]) => {
        if (typeof action !== "string" && !(action instanceof Array)) {
          throw new TypeError(`SocketManager.${moduleName}.delete(elmnt): elmnt must be of type String or String[]`)
        }
        if (action instanceof Array) {
          for (const i of action) {
            if (typeof i != "string") {
              throw new TypeError(`SocketManager.${moduleName}.delete([names]): names must be of type String`)
            }
            delete this[moduleName].listeners[i]
          }
          return
        }
        delete this[moduleName].listeners[action]
      },
      listen: (action: string | CallbackList, func?: Function | null) => {
        // Signature: (Object)
        if (typeof action == "object") {
          for (const i in action) {
            if (typeof i !== "string") {
              throw new TypeError(
                `SocketManager.${moduleName}.listen({<string>: <func>}): Key ${i} is not a string`,
              );
            }

            if (typeof action[i] === "function") {
              this.#listen(moduleName, i, action[i]);
              continue;
            }

            throw new TypeError(
              `SocketManager.${moduleName}.listen({<string>: <func>}): func must be of type Function, got ${typeof action[i]}`,
            );
          }
          return;
        }

        // Signature: (String, Function)
        if (typeof action !== "string") {
          throw new TypeError(
            `SocketManager.${moduleName}.listen(action, func): action must be of type String`,
          );
        }

        if (typeof func === "function") {
          this.#listen(moduleName, action, func);
          return;
        }

        throw new TypeError(
          `SocketManager.${moduleName}.listen(action, func): func must be of type Function, got ${typeof func}`,
        );
      },
    };
    Object.freeze(this[moduleName]);
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

  #emit(module: string, action: string, data: object) {

    this.#socket.send(JSON.stringify({
      module: module,
      action: action,
      data: data,
    }));
  }
}
