import * as express from "express";

var api = express.Router()

api.get(/.*(\.js)/, (req: express.Request, res: express.Response) => {
    res.sendFile(`/${req.path}`, {'root': `${__dirname}'../../../api`});
})

export default api