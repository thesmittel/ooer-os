/**
 * Panels are desktop widgets that themselves can contain small applets similar to a taskbar
 * @file panels.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:UIElements > Panel
 */
/**
 * Panels are desktop widgets that themselves can contain small applets similar to a taskbar
 * @file panels.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:UIElements > Panel
 * @namespace ClientCode.UIElements
 */
/**
 * @module ColorWheel
 * @memberof Client:UIElements
 * @description Panels are desktop widgets that themselves can contain small applets similar to a taskbar
 * @name Client:UIElements > Panel
 * @author Smittel
 */

import { create } from "../Util.mjs"
/*
WIP:
Panels are taskbar-like, similar to panels in modern linux DEs.
they can act like a task bar, contain the system tray, menu button, options, quick access, applets etc in any arrangement

They can be individually styled positioned and their behavior defined in the settings app.

Panels are drawn on top of everything else with position: fixed;

Panel behavior includes:
always visible: does not moves
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
    #position; // (Left/Top)|Center|(Right/Bottom) 
    #attach; #offset; // Edge the panel is attached to, offset XY relative to default
    // Default for edge 
    #applets = []; // list of applets (the respective class object). For simplicity, the taskbar is also an applet 

    #style; // Object, contains additional styling such as offset if floating, background color, corner rounding etc
    #behavior; // additional behavior such as "unfloating" when a window is maximised
    element;
    /**
     * 
     * @param {Object} options 
     * @param {("left"|"top"|"center"|"right"|"bottom")} options.position Defines the position of the panel along the edge. "left" and "top" are interchangeable, as are right and bottom, they only serve as a more descriptive option for horizontal and vertical panels. 
     * @param {("north"|"east"|"south"|"west"|"none")=} [options.attach="none"] Defines the edge of the display a panel is attached to
     * @param {Number[]} [options.offset=[0,0]] position offset relative to default position, [x: Number, y: Number], do NOT include "px"
     * @param {Object=} options.style Defines additional styling
     * @param {String} [options.style.[property]] Things like background-color
     * @param {(0.0-1.0)} [options.opacity=1.0] Defines opacity of panel including panel elements. Use background-color in options.style to make the background transparent.
     * @param {("dodge"|"hide"|"fade"|"shrink"|"none")} options.behavior
     */
    constructor(options) {
        if (!(options.offset instanceof Array)) options.offset = [0,0];
        options.offset = options.offset.map(a => {
            a = parseFloat(a);
            return isNaN(a)?0:a;
        })

        this.element = create({
            tagname: "desktop-panel",
            classList: [],
            style: 
            `--offsetX: ${options.offset[0]}; --offsetY: ${options.offset[1]}`
            // {
                
            //     "--offsetY": 202,
            //     "--offsetX": 42,
            // }
            ,
            childElements: [
                
            ],
            attach: "south",
            floating: false,
            fullwidth: false,
            position: "center"
        })
    }
}


export { Panel }