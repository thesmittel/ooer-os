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

function randomInt(min, max) {
	return (Math.random() * (max - min) + min)
}

function randomId(length) {
	let id = "";
	for (let i = 0; i < length; i++) {
		id += String.fromCharCode(randomInt(0x30, 0x39))
	}
	return id;
}

//Returns true if it is a DOM node
function isNode(o){
    return (
      typeof Node === "object" ? o instanceof Node : 
      o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
    );
  }
  
  //Returns true if it is a DOM element    
  function isElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
  }

function getElement(str) {
	return document.getElementById(str)
}
function clamp(lower, value, upper) {
	return Math.max(lower, Math.min(value, upper))
}

function getParentWindow(el) {
	while (!el.id.match(/^window-\d{12}-\d{12}-\d{12}$/g)) {
		if (el.tagName == "BODY") return null;
		el = el.parentNode;
	}
	return el;
}
export {create, getElement, clamp, getParentWindow, randomInt, randomId}