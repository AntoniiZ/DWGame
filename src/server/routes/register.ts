import * as express from 'express'
import * as passport from 'passport'

var registerRouter = express.Router()

function checkNotAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

registerRouter.get('/', checkNotAuthenticated, (req: any, res: any) => {
    res.render('register.ejs', {
        message: req.flash('registerMessage')
    })
})

registerRouter.post('/', passport.authenticate('local-register', {
    successRedirect : '/',
    failureRedirect : '/register',
    failureFlash : true
}));

export default registerRouter