/**
 * 
 * @file dragging.js
 *
 * @author W3Schools, minor changes by Smittel
 */
/**
 * @module Dragging
 * 
 * @description Disclaimer: Yes i know its not technically allowed. But its just the best thing i found that did it.
 * I imagine theres not many ways to do it vastly differently and i had to alter it slightly to make it
 * work for my purposes beyond just switching around some names. {@link https://www.w3schools.com/howto/howto_js_draggable.asp}
 */
import { getElement, clamp } from "./Util.mjs";
import { maximiseWindow } from "./App.mjs";
import { loseFocus } from "../Handlers.mjs";
/**
 * Adds the necessary event handlers to a div to allow it to be dragged around.
 * If the container div does not have a child div with the id of the parent with "header" appended to it, it can be dragged from everywhere inside the div, if the header is present, only the header will trigger the event
 * @memberof module:Dragging
 * @param {DOMElement:div} elmnt The element to add the dragging function to
 */
function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (elmnt.children[0].id == (elmnt.id + "-header")) {
    // if present, the header is where you move the DIV from:
    elmnt.children[0].onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    // elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    loseFocus(e)
    e = e || window.event;
    e.preventDefault();
    // e.stopPropagation();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    let target = e.target;


    e = e || window.event;
    e.preventDefault();
    // e.stopPropagation();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    // let viewportHeight = window.innerHeight;
    // let viewportWidth = window.innerWidth;
    // Window Snapping
    let newLeft = elmnt.offsetLeft - pos1;
    let newTop =  clamp(0, (elmnt.offsetTop - pos2), window.innerHeight - 30);
    if (elmnt.dataset.maximised == "true" && elmnt.id.match(/^window-\d{12}-\d{12}-\d{12}$/g)) {
      maximiseWindow(elmnt);
      newLeft = e.clientX - parseInt(elmnt.style.width) / 2
      newTop = 0;
    }

    elmnt.style.top = newTop + "px";
    elmnt.style.left = (newLeft) + "px";
    // Prevent from being moved off screen //(elmnt.offsetTop - pos2) + "px";//
    //clamp(0, (elmnt.offsetLeft - pos1), window.innerWidth  - parseInt(elmnt.style.width)) + "px";
    const prev = document.getElementById("snapping-prev")
    let bounds = elmnt.getBoundingClientRect();

    prev.style.left   = bounds.left + "px"
    prev.style.width  = bounds.width + "px"
    prev.style.top    = bounds.top + "px"
    prev.style.height = bounds. height+ "px"

    
    if (parseInt(elmnt.style.top) < 1 && elmnt.dataset.maximised != "true" && elmnt.id.match(/^window-\d{12}-\d{12}-\d{12}$/g)) {
      // if (!elmnt.classList.contains("about-to-be-maximised")) {
        elmnt.classList.add("about-to-be-maximised")
      // }
      prev.dataset.visible = true
    } else {
      prev.dataset.visible = false
      elmnt.classList.remove("about-to-be-maximised")
    }

    // Move staticElements according to parents


  }

  function closeDragElement(e) {
    // e.stopPropagation();
    // stop moving when mouse button is released:
    if (parseInt(elmnt.style.top) < 1 && !elmnt.maximised && elmnt.id.match(/^window-\d{12}-\d{12}-\d{12}$/g)) {
      document.getElementById("snapping-prev").dataset.visible = false
      maximiseWindow(elmnt);
    }
    elmnt.style["z-index"] = elmnt.dataset.oldz
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

export { dragElement }