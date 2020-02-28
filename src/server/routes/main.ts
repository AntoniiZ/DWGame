import * as express from 'express'

var mainRouter = express.Router()

function checkAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

mainRouter.get('/', checkAuthenticated, (req: any, res: any) => {
    res.render('index.ejs', { name: req.user.username })
})

export default mainRouter