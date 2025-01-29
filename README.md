# IMPORTANT
As of the latest commit, it now uses Deno 2 instead of node. 
The backend is slowly changed to typescript for no other reason than sanity during development. Full list of needed packages follows soon, most are part of the Deno std library

## Dependencies
- Serverside
    - Deno 2.1.3
    - Deno @std/http/...
- Clientside
    - All dependencies come bundled, there are no external dependencies.

## THIS IS NOT READY TO USE. DO NOT ATTEMPT TO DO SO!
Some work needs to be done on the backend to properly implement login and signup, as of now, user login info is saved in a JSON, using what i understand to be cryptographically secure methods, i still wouldnt advise using it, though youre free to do so. You can also change the backend, not much going on there so far, but then, theres still the issue of it still being single threaded.

## What is this and what is the goal
The goal is to not only imitate a desktop environment in a website, but also to provide functionality that the streamed nature of the entire thing offers, like sharing files more easily, collaboration (like google drive for example), easy communication etc.
While its usefulness is up for debate, one usecase would be for use within intranets.
One piece of functionality for example would be, that in order to view files, you do not need to locally "install" (or rather, register) an app, only for creating files yourself from scratch. If a file is sent for which you do not have the appropriate "App", it is simply "included" with the file, you will be prompted if you want to register the app for your local account after which you can add a shortcut to your desktop or whatever else.

## Contributing
The module structure will be reworked soon, some of them will disappear entirely, for example: the client side utility functions will probably be added to built in JS objects. This will also mean that proper documentation will be added.

"Applications" will soon switch to a webworker based approach to prevent the whole thing from being locked by a simple loop, for that, a standardised communication interface between the workers and the main thread will be provided, making heavy use of callbacks in a more indirect way. Promises would probably be better but oh well. The switch to webworkers will also mean that windowed applications, background tasks and widgets will use a unified approach. Until now, the idea was to have widgets be their separate thing to windowed application while background tasks were outright banned. The exact nature of this is still unknown. I will probably have a separate permanent webworker that handles communication, spawning and destruction of all other web workers, while the main thread will only respond to UI events and requests. The exact performance impact of such an approach in terms of potential latency has not been assessed yet.

Web workers will get access to different calls depending on app permission level similar to what is already the case. They will be created using the same back end call as right now, the difference is that the JS returned by the server will be turned into a blob. The old ID structure will become the new "process" ID structure, with some changes: `<app id> <instance id> <call id>` where `<call id>` is used for callbacks inside the webworker.

The system worker will be the ultimate authority. It will decide what application can request what kind of data both clientside and serverside.

~~A switch to typescript is NOT planned. I just dont care enough. JSDoc provides the necessary info while writing the code.~~ haha surprise its typescript now
A backend rewrite in Rust is on the table, but for that i have to learn it first

## Current version:
`0.2_250130`

## The Socket Manager
Serves as an abstraction layer over the default WebSocket object.
It handles incoming and outgoing data and sorts it.

### Terminology
- `Module`: A broader group of actions, conceptually close to what modules in JS are. These modules are nothing but a name, useful for easy sorting, for example you can put all the login related requests in a module called "Auth" (as did I)
- `Action`: An action is like a command. Actions can only be registered to a module, to which they then belong. The same action cannot be part of multiple modules. It is possible to have an action of the same name with the same data or callbacks as in another module, but internally, they are different actions and are treated as such.
- `Invalid strings`: Any of the following:
    - `registerModule`
    - `deleteModule`
    - `connectionOpen`
    - `connectionClosed`
    - `error`
    - `constructor`

### How it works
#### 0. Serverside only: Get a websocket object. In Deno, this is done via
```js
const {socket, response} = Deno.upgradeWebsocket(/* HTTP request for websocket upgrade */)
```

---

#### 1. Create a SocketManager instance

CLIENTSIDE: 
```js
const socketmanager = new SocketManager(address);
```
The address is optional, default is `document.location` using the websocket protocol.
It creates a WebSocket object automatically.

SERVERSIDE:
```js
const socketmanager = new SocketManager(socket) // socket being the object that is generated by whatever you choose to upgrade a connection to a websocket.
```

---

#### 2. Initial setup
The only listeners you can explicitly define are the eventlisteners for `open`, `close` and `error`.
Do so using 
```js
socketmanager.connectionOpened(/* Some Function */)
socketmanager.connectionClosed(/* Some Function */)
socketmanager.error(/* Some Function */)
```
Technically this is optional, but you should only start communicating via the websocket if it is connected.

---

#### 3. Register your modules
```js
socketmanager.registerModule(/* Some string */)
```
The name you choose can be almost arbitrary, BUT:
- It is converted to camelCase (preserving existing uppercase)
- All whitespaces and leading digits get removed
- All non-alphanumeric characters are removed
- Some names are invalid, such as
    - Invalid strings (see [Terminology](https://github.com/thesmittel/ooer-os?tab=readme-ov-file#terminology))
    - Names starting with `#`
    - Empty strings
    - Undefined
    - Strings, that after going through the cleanup mentioned above are converted to any of these forbidden names

You can register multiple modules at once by using an array of strings. 
Careful: The same restrictions apply. It WILL throw an error if somethings off.
Also, the logic is implemented recursively. You can pass arrays of arrays of arrays of strings. That probably isnt ideal, but it is possible. Try to avoid it.

---

#### 4. Deleting Modules
The usecase for this is not yet entirely clear to me, but I did not want to not have this option.
```js
socketmanager.deleteModule(/* Some string */);
```
It will throw an error if anything other than a string or an invalid string is passed, it will NOT however provide feedback when trying to delete something that isnt there. It fails silently by design, since nothing can go wrong in this case (nothing at all happens), throwing an exception seems excessive. It does however mean that you need to debug it though some other means, if you really want to know.

! This function executes the same operations as the registerModule function (cleanup and camelCase conversion).

---

#### 5. Sending data

Clientside:
```js
socketmanager.moduleName.send(/* action name */, /* some serialisable data */)
```

Serverside:
There are two options for sending data. You can do it manually 
```js
socketmanager.moduleName.send(/* action name */, /* some serialisable data */)
```
or by returning an object of a specific shape within a listener function registered to a module
```js
function callback(data) {
    ...
    return {
        module: /* module name */,
        action: /* action name */,
        data: /* Some serialisable data */
    }
}
socketmanager.moduleName.listen("action name", callback)
```
Any of the properties are optional. If no module and/or action are specified, it will use the module and/or action of the request. If no data is specified, it will return the following object as data
```json
{
    "error": 1, 
    "message": "No data"
}
```
This is an error by name. It will not cause the clientside code to throw an exception on its own. 
The error codes are arbitrary. There are some other error codes defined in the SocketManager.ts file itself
- `1001` (Module requested by client not registered on the server)
- `1002` (Requested action does not exist for module)
They are what they are because that'll make sense in context of the wider project. Once i release this standalone, there will probably be a config file.

---

#### 6. Receiving data / adding listeners

This is the same on both ends and has already been shown.
```js
socketmanager.moduleName.listen(/*action name */, /* Function */)
```
The server has the opportunity to respond to incoming data directly, as mentioned before. The client can NOT do this! The client is not expected to respond directly, this can be achieved through other means if necessary.
Listeners get called by the SocketManager when the corresponding action is specified in the incoming packet. 
These packets ALWAYS have the shape 
```js
{
    module: /* moduleName (String) */,
    action: /* action name (String) */,
    data: /* some serialisable data of any kind */
}
```
Only the `data` part of this packet gets passed to the listener function. The module and action identifiers are "discarded".

As of now there are no restrictions on action names, that might change in the future, see [`Ideas`](https://github.com/thesmittel/ooer-os?tab=readme-ov-file#ideas)

---

#### 7. Deleting listeners
Removes an action identifier and its corresponding function from the manager, after which it will not be executed anymore, instead, an error is thrown to the developer console.
```js
socketmanager.moduleName.delete(/* action name */);
```

Batch deleting listeners is possible with arrays of strings. However, this time around it is not recursive. 
It will throw an error if neither a string nor an array is passed as well as when there is a non-string element in the array.
It will stay silent when there is no listener with a given name.


#### Ideas
A potential upcoming change: Instead of actions being a dynamic parameter, they may be turned into registered actions. Example:
```js
socketmanager.registerModule("module")
socketmanager.module.registerAction("action", /* optional listener function */)
// Sending data to server
socketmanager.module.action.send(/* some data */)
// changing listener after the fact
socketmanager.module.action.listen(/*some function*/)
```
These solutions could coexist, if `registerAction`, `send`, `listen` and `listeners` are invalid actions and the same naming restrictions apply as for the module names. I'm thinking about it (this idea came while writing step 3 of this instruction)
## Information regarding documentation

### Documentation has not been kept up to date for quite some time now
Modules are divided into groups: `Server:`, `Client:`, `Sysapp:`, `App:` and `ThirdParty:`.
They show these prefixes in the name so its clearer, which is which.

- `Client:` modules are front-end code that runs clientside
- `Server:` is the back-end
- `Sysapp:` are applications that are only sent to the user on demand, while retaining system-level privileges
- `App:` are first-party applications that do not have system-level privileges
- `ThirdParty:` explains third party applications and their limitations

Functions and Properties within modules can have one of two prefixes:
- `Internal:` means, it is not exported
- `Export:` by extention needs no explanation

Documentation is implemented via JSDoc. Works well in VSCode/Codium with JSDoc installed, you know how it works. A minifier will be provided, a simple script that removes all comments to reduce the filesize for eventual deployment. It will save into a separate directory, keeping the development copy intact.

### Windows
Can be moved, closed, minimised, support snapping (so far only for maximising). Taskbar is present and functional, though not yet finished, window previews as well as app instance groups will soon be added.
Both CSS and javascript belonging to a window are locked within their respective "scopes", CSS in particular cannot alter anything outside the window body it belongs to, meaning it essentially functions like iframes.

### Applications
Applications have multiple permission levels that are defined serverside
As of now, all applications run on the main thread, a draw API and webworkers are planned.
`<script>` tags are not permitted and will be deleted serverside, if present in the html of an application. Theres a potential vulnerability still present but for that you still need to use the script delivery system, but that could conceivably be used to bypass the permission level by sending a separate file. But programmatically adding script tags doesnt work for L0/L1 applications (in theory)

- Base (L0): only has access to the actual body of the window, not the header and its elements.
    - No access to global JS objects like `window`, `globalThis` etc.
    - locally scoped Javascript
    - No setInterval (for now, im working on it), setTimeout is available

- Elevated (L1): has access to the entire body of the window, allowing a few extra customisations
    - Other than that, it is the same as L0
    - Server communication will be added for L1 applications soon.

- System (L2): instead of being a regular main thread global scope script that removes access to specific objects, System apps are modules and thus have access to all exposed system functions.

Running scripts without a window doesnt work, not even for system apps. That latter part might change, allowing system apps to set up permanent event handlers, for example.

As of now, only windowed applications are implemented, there are plans for widgets and fullscreen applications in the future.


### "API"
Bit of a stretch, but you can make specific requests to the server based on 4 categories:
- "Client" deals with changes to userdata
- "System" deals with events that directly impact functionality
- "Auth" deals with login, signup, logout
- "App" deals with application requests
Will document soon.



## Planned features
- System level user-specific plugins that can hook into system settings and change the way it operates
    - This may or may not include third party options for replacing nearly everything non-critical
    - For example tiling window management could be one such feature
- The above also entails that the settings app will be restructured in a way that allows third party hooks
- unified UI element styling in the form of custom tags for a more cohesive and easier to write design
    - will also allow easier customisation and even themes.
- App communication with the server, will only be available for system apps for now.
- Search function
- A way to still talk to windows of the same app, not just same instance, while not allowing communication across apps
    - MAYBE ill add that too in a way that apps can only send data and have to decide how they respond to protect data
- Moving desktop symbols
- Dialog boxes for things like Error Messages
- Several system apps that are missing from this version:
    - Settings (only exists visually)
    - Terminal (only exists visually)
    - Notepad (only exists visually)
    - Planner
    - Package manager for "installing" applications, themes etc
    - Messenger
- Widgets that the old version had that this doesnt
    - Notes
    - Calendar
    - Messages
- Applications can call new windows that are then linked (right now, if an application calls multiple windows on startup, the windows are entirely disconnected)
- Social features
    - Friend requests
    - Messaging
    - Event sharing
- Webworker based multithreading
- Multi Desktop
- required password to lock and unlock
- more customisations
- Appearance customisations and themes
- Panel applets
- "Package" and theme manager
- More granular permissions for apps



## Anything else?

At some point in the future, the back end will be rewritten using a better approach using a normal language. Probably rust, tbh, but im not quite sure yet. For now, Node will do. User data will be stored in proper databases, sensitive data will be encrypted (i kinda wanna use the encryption algoritm i made a few years ago, but first i need to figure out how to have it accept keys, but maybe ill just do a hybrid with my own and something more common like RSA)

Maybe i will also make it into a desktop app using NW.js
This will mean that there is no need for a server, but the option to connect to one will be there after which it will function like the website, with locally saved login information if theres multiple servers. Once thats working maybe it can be turned into a desktop environment for linux too using the same functionality, but thats far far into the future, v3.0 kinda far.

The website will NOT get any of the features that the desktop app/environment will receive, it doesnt really make sense considering you need to connect to a specific server anyways
