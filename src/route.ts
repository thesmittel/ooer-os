import { serveDir, serveFile } from "jsr:@std/http/file-server";
import { numberOfFilesToServe } from "./connection/handlers/Auth.ts";
export async function route(req: Request) {
  const url: string[] = req.url.split("/").filter((a) => a != "");

  // console.log(url, url.length)
  // console.log(url[2])
  // console.log(import.meta.url)

  if (url.length == 2) {
    return await serveFile(req, "./client/index.html", {
      etagAlgorithm: "SHA-256",
    });
  }

  const path = url.slice(2).join("/");

  // console.log("first: ", "./client/public/"+path)
  // console.log("second: ", "./server/media/"+decodeURI(path))
  switch (url[2]) {
    case "js": {
      console.log("/client/public/", path)
      numberOfFilesToServe()
      return await serveDir(req, {
        fsRoot: "client/desktop",
        urlRoot: "js"
      })
    }
    case "css":
    case "fonts":
    case "boxicons-2.1.4": {
      return await serveFile(req, "./client/public/" + decodeURI(path), {
        etagAlgorithm: "SHA-256",
      });
    }
    case "init": {
      return await serveDir(req, {
        fsRoot: "client/init",
        urlRoot: "init",
      });
    }
    case "desktop": {
      console.log(url)
      // Maybe uncomment
      // breaks with disabled caching but only needs one HTTP request
      // if (url [3] == "main.js") {
        return await serveDir(req, {
          fsRoot: "client/desktop",
          urlRoot: "desktop",
        });
      // }
      // break
    }
    case "components": {
      return await serveDir(req, {
        fsRoot: "client/components",
        urlRoot: "components"
      })
    }
    case "media": {
      return await serveFile(req, "./server/" + decodeURI(path), {
        etagAlgorithm: "SHA-256",
      });
    }
  }
}

function html(returnData: any) {
  return new Response(returnData, {
    headers: {
      "content-type": "text/html",
    },
  });
}

function css(returnData: any) {
  return new Response(returnData, {
    headers: {
      "content-type": "text/css",
    },
  });
}

function js(returnData: any) {
  return new Response(returnData, {
    headers: {
      "content-type": "text/javascript",
    },
  });
}

function image(returnData: any) {
  return new Response(returnData, {
    headers: {
      "content-type": "image/jpg",
    },
  });
}
