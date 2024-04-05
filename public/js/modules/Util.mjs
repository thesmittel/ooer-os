/**
 * Served to client on page load. Contains utility functions.
 * @file Util.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:Util
 * @see <a href="./client.Client_Util.html">Module</a>
 */
/**
 * Served to client on page load. Contains utility functions.
 * @file Util.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:Util
 * @see <a href="./client.Client_Util.html">Module</a>
 * @namespace ClientCode
 */
/**
 * @module Util
 * @memberof client
 * @description Various utility functions
 * @name Client:Util
 * @author Smittel
 */

/**
 * Takes an object of a specific format and can recursively create a DOM subtree, which is then returned.
 * It is not appended to anything, it only exists in memory, until manually appended. 
 * Note that since it works by reference, it is not possible to append it to multiple different DOM Elements without making a deep copy.<br>
 * The list of child elements can contain both Objects that match the required format or actual DOM Elements. <br>
 * eventListener takes any number of event names as you would use with <code>addEventListener</code> as key, with the function to be executed being the value.<br>
 * Besides the explicitly mentioned properties, any property can also be set simply by taking the name of the property as the key and the value being the value.
 * @param { Object } args 
 * @method create
 * @name Export:create
 * @returns DOMElement
 * @example {
 * 	tagname: "HTML tag name",
 *	dataset: {
		attributeName: "attributeValue",
		howeverMany: "youNeed"
 	},
	classList: ["css-class-name", "supports-multiple"],
	style: "direct css styling either as string or object",
	eventListener: {
		"EventType": function
	},
	childElements: [
		{another object of the same format},
		aDomElementCreatedEarlier
	]
 * }
 */
function create(args) {
	let e = document.createElement(args.tagname);
	if(args) {
		for (let a in args) {
			switch (a) {
				case "dataset":
					for (let d in args.dataset) {
						e.dataset[d] = args.dataset[d];
					}
					break
				case "classList":
					e.classList.add(...args.classList);
					break;
				case "eventListener":
					for (let d in args.eventListener) {
						e.addEventListener(d, args.eventListener[d])
					}
					break;
				case "childElements":
                    for (let c of args.childElements) {
                        if (c instanceof HTMLElement) {
                            e.append(c)
                        } else {
                            e.append(create(c))
                        }
                    }
					break;
				case "style":
					if (typeof(args[a]) == "object") {
						for (let s in args[a]) {
							e.style[s] = args[a][s];
						}
					} else {
						e[a] = args[a];
					}
					break;
				default:
					e[a] = args[a];
			}
		}
	}
	return e;
}

/**
 * Generates a random number. Actual distribution is based on the implementation of Math.random()
 * @param { Number } min Lower bound
 * @param { Number } max Upper Bound
 * @method randomInt
 * @name Export:randomInt
 * @returns Random number between min and max inclusive
 * @todo change to a modulo based approach to somewhat mitigate any issues regarding homogeneity of Math.random()
 */
function randomInt(min, max) {
	return (Math.random() * (max - min) + min)
}

/**
 * Generates a string of digits with a given length
 * @param { Number } length 
 * @method randomId
 * @name Export:randomId
 * @returns A string of decimal digits with the specified length
 */
function randomId(length) {
	let id = "";
	for (let i = 0; i < length; i++) {
		id += String.fromCharCode(randomInt(0x30, 0x39))
	}
	return id;
}

/**
 * Returns true if it is a DOM node. Proved unreliable (I think). 
 * @param { Object } o Object to check
 * @method isNode
 * @name Export:isNode
 * @deprecated
 * @see Util~isElement
 * @returns Boolean
 */
function isNode(o){
    return (
      typeof Node === "object" ? o instanceof Node : 
      o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
  }
  
  //
/**
 * Returns true if it is a DOM element  
 * @param { Object } o Object to check 
 * @method isElement
 * @name Export:isElement
 * @returns Boolean
 */   
  function isElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
  }

/**
 * Shorthand for document.getElementById()
 * @param { String } str ID of DOM Element
 * @method getElement
 * @name Export:getElement
 * @returns DOM Element
 */
function getElement(str) {
	return document.getElementById(str)
}

/**
 * Clamps a variable between fixed bounds
 * @param { Number } lower Minimum value
 * @param { Number } value Variable value
 * @param { Number } upper Maximum value
 * @method clamp
 * @name Export:clamp
 * @returns Clamped number
 */
function clamp(lower, value, upper) {
	return Math.max(lower, Math.min(value, upper))
}

/**
 * Finds the parent window of an element by walking up the DOM Tree until it finds an ID that matches the format used by windows.<br>
 * @param { DOMElement } el 
 * @returns DOMElement, if window was found, <code>null</code> if given element was not part of a window
 * @method getParentWindow
 * @name Export:getParentWindow
 */
function getParentWindow(el) {
	while (!el.id.match(/^window-\d{12}-\d{12}-\d{12}$/g)) {
		if (el.tagName == "BODY") return null;
		el = el.parentNode;
	}
	return el;
}

/**
 * Map of characters to be sanitised for use in HTML without being parsed as actual HTML
 * @constant Object 
 * @name Internal:sanitationMap
 */
const sanitationMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&apos;"
}

/**
 * Sanitises text by replacing relevant characters. Returns empty string, 
 * if a falsy element is provided. "false" (String), 0, -0 and 0n (BigInt(0)) are treated separately
 * to prevent unusual behaviour.
 * @param { String } text 
 * @returns Sanitised String
 * @method sanitise
 * @name Export:sanitise
 */
function sanitise(text) {
	if (text === "false" || typeof text == "number" || text === 0n) return text
    if (text) {
        for (let x in sanitationMap) {
            text = text.replaceAll(new RegExp(x, "g"), sanitationMap[x])
        }
    }
    return text || "";
}

/**
 * Reverses sanitation of text. This is not advised, unless critically important.
 * Not guaranteed to be a 1 to 1 undo of the sanitise function. Edge cases are handled the same.
 * @see Util~Export:sanitise
 * @param { String } text 
 * @returns Unsanitised String
 * @method unsanitise
 * @name Export:unsanitise
 */
function unsanitise(text) {
	if (text === "false" || typeof text == "number" || text === 0n) return text
    if (text) {
        for (let x in sanitationMap) {
            text = text.replaceAll(new RegExp(sanitationMap[x], "g"), x)
        }
    }
    return text || "";
}

export {create, getElement, clamp, getParentWindow, randomInt, randomId, sanitise, unsanitise, isNode}