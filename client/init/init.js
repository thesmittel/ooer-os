
import { Auth } from "./Connect.mjs";

document.addEventListener("contextmenu", (e)=>{
  e.stopPropagation(); 
  e.preventDefault()
})

globalThis.create = function create(args, debug) {
  if (debug) console.log(args);
  let e = document.createElement(args.tagname);
  delete args.tagname;
  if (args) {
    for (let a in args) {
      switch (a) {
        case "dataset":
          for (let d in args.dataset) {
            e.dataset[d] = args.dataset[d];
          }
          break;
        case "classList":
          e.classList.add(...args.classList.filter((a) => a && a.length != 0));
          break;
        case "eventListener":
          for (let d in args.eventListener) {
            e.addEventListener(d, args.eventListener[d]);
          }
          break;
        case "childElements":
          for (let c of args.childElements) {
            if (c instanceof HTMLElement) {
              e.append(c);
            } else {
              e.append(create(c));
            }
          }
          break;
        case "style":
          if (typeof (args[a]) == "object") {
            for (let s in args[a]) {
              e.style[s] = args[a][s];
            }
          } else {
            e[a] = args[a];
          }
          break;
        case "innerHTML":
        case "innerText":
          e[a] = args[a];
          break;
        default:
          e.setAttribute(a, args[a]);
          e[a] = args[a];
      }
    }
  }
  return e;
};
const loadingAnim = Array.from(document.querySelector("div.blackout").childNodes).filter(a => a.dataset)
console.log(loadingAnim)
loadingAnim.forEach(a => a.style.opacity = 1)
export function setupAuthListeners(sm) {
  sm.Auth.listen("confirmLogin", (d) => {
    sm.registerModule("User");
    sm.registerModule("App");
    sm.registerModule("System");

    // const script = document.createElement("script");
    // script.src = "/desktop/main.js";
    // script.type = "module";
    // document.head.append(script);
    console.log("gssgs<ggsdgsdB", d)
    loadingAnim.unshift(create({
      tagname: "div",
      classList: ["welcome-text"],
      innerText: `Welcome, ${d.nickname || d.username}!`,
      style: "opacity: 0;"
    }))
    console.log("div.blackout", document.querySelector("div.blackout"))
    console.log(loadingAnim)
    document.querySelector("div.blackout").append(...loadingAnim)
    loadingAnim.forEach(a => {
      a.style.opacity = 1
    })
    console.log("confirmlogin")
    document.head.append(
      create({
        tagname: "script",
        src: "/desktop/main.js",
        type: "module",
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/desktop.css"
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/window.css"
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/ui.css"
      }),
      create({
        tagname: "link",
        rel: "stylesheet",
        href: "/desktop/css/de.css"
      })
    );
  });

  sm.Auth.listen("error", (err) => {
    console.log(err);
  });
}

export function openLoginDialog() {
  removeLoadingAnimation();

  function loginKeyDown(e) {
    if (e.key == "Enter") login();
  }

  const loginscreen = create({
    tagname: "login-main",
    childElements: [
      {
        tagname: "div",
        classList: ["login-big"],
        childElements: [
          {
            tagname: "div",
            classList: ["login-container"],
            id: "login-container",
            dataset: { error: "none" },
            childElements: [
              {
                tagname: "div",
                classList: ["default-pfp"],
              },
              {
                tagname: "input",
                type: "text",
                placeholder: "Username",
                id: "login-user",
                dataset: { form: "login" },
                eventListener: { keydown: loginKeyDown },
              },
              {
                tagname: "input",
                type: "password",
                id: "login-password",
                placeholder: "Password",
                dataset: { form: "login" },
                eventListener: { keydown: loginKeyDown },
              },
            ],
          },
          {
            tagname: "div",
            classList: ["login-buttons"],
            childElements: [
              {
                tagname: "a",
                classList: ["login-button"],
                childElements: [
                  {
                    tagname: "i",
                    classList: ["bx", "bx-x", "bx-md"],
                  },
                ],
                eventListener: { click: closeLogin },
              },

              {
                tagname: "div",
              },
              {
                tagname: "a",
                classList: ["login-button"],
                childElements: [
                  {
                    tagname: "i",
                    classList: ["bx", "bx-right-arrow-alt", "bx-md"],
                  },
                ],
                eventListener: {
                  "click": login,
                },
              },
            ],
          },
        ],
      },
    ],
  });

  document.querySelector("div.blackout").append(loginscreen);
  setTimeout(() => {
    loginscreen.style.opacity = 1;
  }, 0);

  loginscreen.querySelector("#login-user").focus();
  function closeLogin(e) {
    loginscreen.dataset.fade = "out";
    setTimeout(() => {
      loginscreen.remove();
    }, 200);
  }
  function login(e) {
    console.log("login");
    
    loginscreen.addEventListener("transitionend", (e) => {
      loginscreen.remove();
      console.log("removed");
    })
    loginscreen.style.opacity = 0;
    Auth("login", {
      username: loginscreen.querySelector("input#login-user").value,
      password: loginscreen.querySelector("input#login-password").value,
    });
  }
}

function removeLoadingAnimation() {
  loadingAnim.forEach((a) => {
    a.style.opacity = 0
    a.addEventListener("transitionend", () => {a.remove()})
  });
}
