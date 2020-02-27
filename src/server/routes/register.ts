import * as express from "express";
import { users } from '../server'
const bcrypt = require('bcrypt')

var registerRouter = express.Router()

function checkNotAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

registerRouter.get('/', checkNotAuthenticated, (req: express.Request, res: express.Response) => {
    res.render('register.ejs')
})

registerRouter.post('/', checkNotAuthenticated, async (req: express.Request, res: express.Response) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            username: req.body.username,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

export default registerRouter