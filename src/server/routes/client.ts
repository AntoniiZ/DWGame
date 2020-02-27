import * as express from "express"

var clientRouter = express.Router()

function checkAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

clientRouter.get(/.*(\.js|\.html|\/)/, checkAuthenticated, (req: any, res: any) => {
    
    if(req.path == '/'){
        return res.redirect(`${req.baseUrl}/index.html`)
    }
    if(!req.path.endsWith('.html')){
        return res.sendFile(`/${req.path}`, {root: `${__dirname}'../../../client`});
    }
    return res.render('game.ejs', {
        username: req.user.username
    })
})


export default clientRouter