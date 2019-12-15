import * as express from "express";

var apiRouter = express.Router()

apiRouter.get(/.*(\.js)/, (req: express.Request, res: express.Response) => {
    if(req.path == '/'){
        res.redirect(`${req.baseUrl}/index.html`)
    }
    res.sendFile(`/${req.path}`, {'root': `${__dirname}'../../../api`});
})

export default apiRouter