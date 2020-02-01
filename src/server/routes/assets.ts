import * as express from "express";

var assetsRouter = express.Router()

assetsRouter.get(/.*(\.png|\.jpg|\.mp3)/, (req: express.Request, res: express.Response) => {
    res.sendFile(`/${req.path}`, {'root': `${__dirname}'../../../assets`});
})

export default assetsRouter