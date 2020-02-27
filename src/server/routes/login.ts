import * as express from "express";
const passport = require('passport')

var loginRouter = express.Router()

function checkNotAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

loginRouter.get('/', checkNotAuthenticated, (req: express.Request, res: express.Response) => {
    res.render('login.ejs')
})

loginRouter.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true    
}))

export default loginRouter