

export class SocketManager {
  #socket;
  #invalid = [
    ...Object.getOwnPropertyNames(this),
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(this)),
    "",
    undefined,
  ];
  constructor(address = document.location) {
    this.#socket = new WebSocket(address);
    this.#socket.addEventListener("message", (e) => {
      this.#onMessage(e);
    });
  }
  // maybe 
  // get connectionOpened() 
  connectionOpened(callback) {
    if (typeof callback !== "function") {
      throw new Error(
        "Socket.connectionOpened(callback): Callback must be function",
      );
    }
    this.#socket.addEventListener("open", (e) => {
      callback(e);
    });
  }

  connectionClosed(callback) {
    if (typeof callback !== "function") {
      throw new Error(
        "Socket.connectionClosed(callback): Callback must be function",
      );
    }
    this.#socket.addEventListener("close", (e) => {
      callback(e);
    });
  }

  error(callback) {
    if (typeof callback !== "function") {
      throw new Error("Socket.error(callback): Callback must be function");
    }
    this.#socket.addEventListener("error", (e) => {
      callback(e);
    });
  }

  #onMessage({ data }) {
    const response = JSON.parse(data);
    console.log("socket response", response)
    if (this[response.module] == undefined) {
      throw new ReferenceError(`Socket: Module ${response.module} not defined`);
    }
    if (this[response.module].listeners[response.action] == undefined) {
      throw new ReferenceError(
        `Socket: Action "${response.action}" not defined for module "${response.module}"`,
      );
    }
    this[response.module].listeners[response.action](response.data);
  }

  deleteModule(moduleName ) {
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

  #cleanupString(str) {
    str = str.trim();
    str = str.replace(/([^\s\w]+)/g, "");
    str = str.replace(/^(\d+)|/g, "");
    return str
  }

  #convertToCamelCase(str) {
    str.matchAll(/(?:\s+)(.)/g).forEach((match) => {
      str = str.replace(match[0], match[1].toUpperCase());
    });
    return str
  }

  registerModule(moduleName) {
    if (!moduleName) {
      throw new ReferenceError(
        "Socket.registerModule(name): name not defined",
      );
    }
    if (moduleName instanceof Array) {
      name = moduleName.flat(); // added this bc why the fuck not, at least its not full yolo recursive
      for (const i of moduleName) {
        this.registerModule(i)
      }
      return
    }
    if (typeof moduleName != "string") {
      throw new TypeError(`Socket.registerModule(name): name must be String, got "${name}" of type ${typeof name}`)
    }
    moduleName = this.#cleanupString(moduleName)
    moduleName = this.#convertToCamelCase(moduleName)
    
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
      send: (action, data) => {
        this.#send(moduleName, action, data);
      },
      delete: (action) => {
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
      listen: (action, func) => {
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

  #listen(module, action, func) {
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
  #send(module, action, data) {
    if (typeof action !== "string") {
      throw new TypeError(
        `Socket.${module}.send(action, func): Argument 'action' must be of type string!`,
      );
    }
    this.#emit(module, action, data);
  }

  #emit(module, action, data) {
    this.#socket.send(JSON.stringify({
      module: module,
      action: action,
      data: data,
    }));
  }
}

// const handlers = {};
// const socket = new WebSocket(document.location);
// console.log(socket);

// socket.emit = function (module, action, data) {
//   socket.send(JSON.stringify({
//     module: module,
//     action: action,
//     data: data,
//   }));
// };

// socket.addEventListener("message", ({ data }) => {
//   const response = JSON.parse(data);
//   if (communicate[response.module] == undefined) {
//     throw new ReferenceError(`Socket: Module ${response.module} not defined`);
//   }
//   if (communicate[response.module][response.action] == undefined) {
//     throw new ReferenceError(
//       `Socket: Action "${response.action}" not defined for module "${response.module}"`,
//     );
//   }
//   communicate[response.module][response.action](response.data);
// });

// const communicate = {};
// Object.defineProperty(communicate, "registerModule", {
//   enumerable: false,
//   configurable: false,
//   writable: false,
//   value: function (moduleName) {
//     if (moduleName == "registerModule") throw new ValueError(`Socket.registerModule(name): '${moduleName} is an invalid name'`)
//     if (communicate[moduleName]) {
//       throw new ValueError("Module " + moduleName + " already registered!");
//     }
//     if (typeof moduleName !== "string") {
//       throw new TypeError(
//         "Socket.registerModule(name): Argument 'name' must be of type string!",
//       );
//     }
//     communicate[moduleName] = {};
//     Object.defineProperties(communicate[moduleName], {
//       on: {
//         enumerable: false,
//         configurable: false,
//         writable: false,
//         value: function (action, func) {
//           if (typeof action !== "string") {
//             throw new TypeError(
//               `Socket.${moduleName}.on(action, func): Argument 'action' must be of type string!`,
//             );
//           }
//           if (typeof func !== "function") {
//             throw new TypeError(
//               `Socket.${moduleName}.on(action, func): Argument 'func' must be of type function!`,
//             );
//           }
//           communicate[moduleName][action] = func;
//         },
//       },
//       send: {
//         enumerable: false,
//         configurable: false,
//         writable: false,
//         value: function (action, data) {
//           if (typeof action !== "string") {
//             throw new TypeError(
//               `Socket.${moduleName}.send(action, func): Argument 'action' must be of type string!`,
//             );
//           }
//           socket.emit(moduleName, action, data);
//         },
//       },
//     });
//   },
// });

// // export { communicate as socket };
