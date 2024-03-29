# OoerOS

A website designed to emulate your typical graphical consumer OS that supports third party applications.
It is more a proof of concept, a bit of fun, rather than anything useful.

## Features

- Looks and feels like an operating system
- Doesnt work like one
- Registering and logging in
- Windows:
    - Moving
    - Snapping (only maximising)
    - minimising
    - closing
- "Applications"
    - Multiple permissions levels
        - System (level 2): access to entire document including socket
        - Elevated (level 1): can modify its own windows entirely allowing for example dialog boxes asking the user to save
        - Base (level 0): can only modify the body of the window, not the header
    - Global objects have been disabled for levels 1 and 0, so no `window`, `globalThis` etc.
    - CSS is entirely local, meaning theres no restriction on styling, it will only ever effect the windowbody
    - JS is entirely local too
    - no intervals for permission levels 0 and 1
    - `<script>` are not allowed in an applications HTML itself, scripts will be added to an applications window by the "OS" itself. The tags and their content are removed by the server.
        - programmatically creating script elements will not work either for permission levels 0 and 1
    - as of now, there is no way to run scripts without a window. That wouldnt even really make sense considering you cant access anything outside, but it just wont do it. 
    - Applications can have several different forms, windowed, fullscreen, widget
    - System level applications are themselves modules. They thus have access to all other system modules. 
- "API": Server requests are grouped into 4 categories:
    - "Client" deals with changes to userdata
    - "System" deals with events that directly impact functionality
    - "Auth" deals with login, signup, logout
    - "App" deals with application requests
    - Soon there will be documentation
- Everything is neatly hidden away in modules, meaning not even system applications have access to system internals (for now)
- Notifications (Have to go through server)

## Coming soon
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