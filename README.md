

## Dependencies
- Node, exact minimum compatible version unknown, i estimate at least v16, potentially v18, but v21 is advised
- `express`
- `socket.io`

## THIS IS NOT READY TO USE. DO NOT ATTEMPT TO DO SO! 
Some work needs to be done on the backend to properly implement login and signup, as of now, user login info is saved in a JSON using MD5, while the salt is fairly big, i still wouldnt advise using it.

## Contributing
A fairly large restructuring of the repo is planned and will happen sometime in the next few weeks. It will more clearly separate the front end and back end code. i will the module structure will also be reworked, some will disappear entirely, for example: the client side utility functions will probably be added to built in JS objects. This will also mean that proper documentation will be added.

"Applications" will soon switch to a webworker based approach to prevent the whole thing from being locked by a simple loop, for that, a standardised communication interface between the workers and the main thread will be provided, making heavy use of callbacks in a more indirect way. Promises would probably be better but oh well. The switch to webworkers will also mean that windowed applications, background tasks and widgets will use a unified approach. Until now, the idea was to have widgets be their separate thing to windowed application while background tasks were outright banned. The exact nature of this is still unknown. I will probably have a separate permanent webworker that handles communication, spawning and destruction of all other web workers, while the main thread will only respond to UI events and requests. The exact performance impact of such an approach in terms of potential latency has not been assessed yet. 

Web workers will get access to different calls depending on app permission level similar to what is already the case. They will be created using the same back end call as right now, the difference is that the JS returned by the server will be turned into a blob. The old ID structure will become the new "process" ID structure, with some changes: `<app id> <instance id> <call id>` where `<call id>` is used for callbacks inside the webworker.

The system worker will be the ultimate authority. It will decide what application can request what kind of data both clientside and serverside.

A switch to typescript is NOT planned. I just dont care enough.

## Current version:
`0.1.20240713`

## Information regarding documentation
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



## Coming soon
- unified UI element styling in the form of custom tags for a more cohesive and easier to write design 
    - will also allow easier customisation and even themes.
- App communication with the server, will only be available for system apps for now.
- Search function
- Clocks
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
- Replacing fontawesome with a non-tracking alternative

## Anything else?
Eventually, i plan on rewriting the backend entirely using a more "professional" approach instead of a Node.JS script and a billion modules but for now, thatll do. I do not plan on using any frameworks for the front-end, this project is too different to what a website is "supposed" to be, i dont think those would be of much help, so i want to keep this as vanilla as possible. For now im sticking to EN (like M.E.A.N., but not) Express/Socket.io plus Node on the backend, JSON WILL be replaced though, probably by MongoDB, not decided yet.
Depending on how i feel i may even go serverless somewhere down the line, but i doubt it.

