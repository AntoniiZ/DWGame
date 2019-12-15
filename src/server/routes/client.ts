import * as express from "express"

var clientRouter = express.Router()

clientRouter.get(/.*(\.js|\.html|\/)/, (req: express.Request, res: express.Response) => {
    if(req.path == '/'){
        res.redirect(`${req.baseUrl}/index.html`)
    } else {
        res.sendFile(`/${req.path}`, {'root': `${__dirname}'../../../client`});
    }
})


export default clientRouter