import { __dirname } from "./misc.ts"

function base(req, res) {
    res.sendFile(__dirname + "/client/index.html")
}

function imagesQuery(req, res) : void {
    res.sendFile(__dirname + "/server/media/images/" + req.query.i)
}

function iconsQuery(req, res) : void {
    res.sendFile(__dirname + "/server/media/icons/" + req.query.i)
}

function images(req, res) :void {
    res.sendFile(__dirname + "/server/media/images/" + req.params.img)
}

function icons(req, res) : void {
    res.sendFile(__dirname + "/server/media/icons/" + req.params.img)
}

function desktopIcons(req, res) : void {
    const isSystem : boolean = req.params.app.match(/^\d{12}$/g)
    res.sendFile(__dirname + `/server/applications/custom/${isSystem?"system":"custom"}/icon.png`)
    // if (req.params.app.match(/^\d{12}$/g)) {
    //     res.sendFile(__dirname + "/server/applications/custom/" + req.params.app + "/icon.png")
    //     return
    // }
    // res.sendFile(__dirname + "/server/applications/system/" + req.params.app + "/icon.png")
}

export { base, imagesQuery, iconsQuery, images, icons, desktopIcons }