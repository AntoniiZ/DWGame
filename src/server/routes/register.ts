import * as express from 'express'
import * as bcrypt from 'bcrypt'
import { users } from '../server'

var registerRouter = express.Router()

function checkNotAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

registerRouter.get('/', checkNotAuthenticated, (req: any, res: any) => {
    res.render('register.ejs')
})

registerRouter.post('/', checkNotAuthenticated, async (req: any, res: any) => {
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