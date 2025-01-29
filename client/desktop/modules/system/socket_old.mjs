import { ValueError } from "../../error/Error.mjs";

export class Socket {
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

  #emit(module, action, data) {
    this.#socket.send(JSON.stringify({
      module: module,
      action: action,
      data: data,
    }));
  }

  deleteModule(moduleName ) {
    if (typeof moduleName !== "string") {
      throw new TypeError("SocketManager.deleteModule(name): name must be of type string")
    }
    if (this.#invalid.includes(moduleName)) { 
      throw new ReferenceError(`SocketManager.deleteModule(name): Cannot delete ${moduleName}`)
    }
    delete this[moduleName]
  }

  registerModule(moduleName) {
    // if (moduleName.send) console.log("send present")
    // First check if name is string, important later
    if (typeof moduleName !== "string") {
      throw new TypeError(
        "Socket.registerModule(name): Argument 'name' must be of type string!",
      );
    }
    // Remove leading and trailing whitespace, then convert to camel case.
    // ensuring registered modules are callable via the syntax Socket.moduleName.
    // mostly a cosmetic choice, i admit.
    moduleName = moduleName.trim();
    // Remove everything except alphanumerics and whitespace
    // Numbers are kept because only leading digits need to be replaced and this needs to happen AFTER everything else is cleaned up
    // whitespace is kept for the camelCase conversion
    moduleName.replace(/([^\s\w]+)/g, "");
    // Remove leading digits (invalid variable names)
    moduleName = moduleName.replace(/^(\d+)|/g, "");
    // if cleanup left an empty string, the name is invalid
    // examples of invalid names would be
    // 5432-.,
    // .86
    if (moduleName == "") {
      throw new ValueError("Socket.registerModule(name): Invalid module name");
    }
    moduleName.matchAll(/(?:\s+)(.)/g).forEach((match) => {
      moduleName = moduleName.replace(match[0], match[1].toUpperCase());
    });

    // anything that converts to "registerModule" must not be a custom module, this would override this function.
    // modules starting with "#" are invalid, because private fields cannot be declared here, and if they could, they wouldnt be callable from outside the class.
    if (this.#invalid.includes(moduleName) || moduleName.charAt(0) == "#") {
      throw new ValueError(
        "Socket.registerModule(name): " + moduleName + " is an invalid name.",
      );
    }
    // Declaring the same module twice makes no sense, nothing will change, so this is likely a mistake.
    if (this[moduleName]) {
      throw new ValueError(
        "Socket.registerModule(name): Module " + moduleName +
          " already registered!",
      );
    }
    this[moduleName] = {};

    Object.defineProperties(this[moduleName], {
      listeners: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: {},
      },
      listen: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: (action, func) => {
          if (typeof action !== "string") {
            throw new TypeError(
              `Socket.${moduleName}.on(action, func): Argument 'action' must be of type string!`,
            );
          }
          if (typeof func !== "function") {
            throw new TypeError(
              `Socket.${moduleName}.on(action, func): Argument 'func' must be of type function!`,
            );
          }
          this[moduleName].listeners[action] = func;
        },
      },
      send: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: (action, data) => {
          if (typeof action !== "string") {
            throw new TypeError(
              `Socket.${moduleName}.send(action, func): Argument 'action' must be of type string!`,
            );
          }
          this.#emit(moduleName, action, data);
        },
      },
    });
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
