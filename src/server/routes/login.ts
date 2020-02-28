import * as express from 'express'
import * as passport from 'passport'

var loginRouter = express.Router()

function checkNotAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

loginRouter.get('/', checkNotAuthenticated, (req: any, res: any) => {
    res.render('login.ejs')
})

loginRouter.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true    
}))

export default loginRouter