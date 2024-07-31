/*
WIP:
Panels are taskbar-like, similar to cinnamon panels.
they can act like a task bar, contain the system tray, menu button, options, quick access, applets etc in any arrangement

They can be individually styled positioned and their behavior defined in the settings app.

Panels are drawn on top of everything else with position: fixed;

Panel behavior includes:
always visible: does not move
unfloat: attaches itself to edge of screen if active window is maximised
hide: panel is hidden when active window is maximised

hide modes: slide, fade, pop
slide animates position, fade animates opacity, pop simply sets the visibility property

floating panels do not influence the maximised window size

both attached and floating panels can have either fixed or dynamic width

Additional info: 
floating panels cannot be full width/height.
full-width/height panels occupy 3 positions with top-bottom priority:
NW  N  NE
W       E
SW  S  SE
A full width south attached panel occupies SW, S and SE.
A full height west attached panel with the former also present then only occupies the NW and W positions, but scaling such that there is no gap between unless a gap is specified.
if a north attached full width panel is added, the west attached panel will shrink to make room.
(Maybe it would also be great to allow the user to specify this, maybe with a setting for each "end" of the panel setting the priority)

two floating panels cannot occupy the same position
a floating and an attached panel can, the floating panel will be shifted accordingly.
Attached panels have drawing priority over floating panels, meaning if a floating panel is set to "hide", it will slide under the attached panel.
If the floating panel isnt set to hide but an attached panel in the same position is set to hide, the position of the floating panel will be shifted when the attached panel is hidden, the position of the float panel is thus relative to the inside edge of the attached panel.
*/

class Panel {
    #position; // Cardinal, edge or corner (i.e. "N", "SW", etc)
    #applets; // list of applets (Objects). For simplicity, the taskbar is also an applet 
    #style; // Object, contains additional styling such as offset if floating, background color, corner rounding etc
    #behavior; // additional behavior such as "unfloating" when a window is maximised
}