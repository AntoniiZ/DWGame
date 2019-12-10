import * as express from "express"

var client = express.Router()

client.get(/.*(\.js|\.html|\/)/, (req: express.Request, res: express.Response) => {
    if(req.path == '/'){
        res.redirect(`${req.baseUrl}/index.html`)
    }
    res.sendFile(`/${req.path}`, {'root': `${__dirname}'../../../client`});
})


export default client