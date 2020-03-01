import * as express from 'express'

var logoutRouter = express.Router()

function checkAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}


logoutRouter.get('/', checkAuthenticated, (req: any, res: any) => {
    req.session.destroy((err: any) => {
        res.redirect('/login');
    });
})

export default logoutRouter