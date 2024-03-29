# OoerOS

A website designed to emulate your typical graphical consumer OS that supports third party applications.
It is more a proof of concept, a bit of fun, rather than anything useful.

## Current version:
`0.1.240329`

## Features

- Login and signup somewhat functional
- UI largely functional
- Still lacking actual functionality
- Push notifications (Have to go through server)

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
- "globalise" emitter and listener events for system apps only
- App communication with the server, will only be available for system apps for now.
- Search function
- Clocks
- A way to still talk to windows of the same app, not just same app, while not allowing communication across apps
    - MAYBE ill add that too in a way that apps can only send data and have to decide how they respond to protect data
- Dialog boxes for things like Error Messages
- Desktop symbols to launch apps
- Several system apps that are missing from this version:
    - Settings
    - Terminal
    - Notepad
    - Planner
    - Package manager for "installing" applications
- Widgets that the old version had that this doesnt
    - Notes
    - Calendar
- Push notification (only in DOM, not using the frankly annoying notifications feature that some browsers now offer)
- Applications can call new windows that are then linked (right now, if an application calls multiple windows on startup, the windows are entirely disconnected)
- Social features
    - Friend requests
    - Messaging
    - Event sharing
- Allow system apps to augment the actual system instead of being standalone apps with access to the modules. Meaning: give system access to system apps too via a sort of interface