const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

export default function initialize(passport: any, getUserByName: any, getUserById: any) {
    const authenticateUser = async (username: any, password: any, done: any) => {
        const user = getUserByName(username)
        if(user == null) {
            return done(null, false, { 
                message: 'No user with that username'
            })
        }
        try {
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, { 
                    message: 'Incorrect password!'
                })
            } 
        } catch (e) {
            return done(e)
        }
    }
    passport.use(
        new LocalStrategy({ usernameField: 'username'},
    authenticateUser)
    )
    passport.serializeUser((user: any, done: any) => {
        return done(null, user.id) 
    })
    passport.deserializeUser((id: any, done: any) => {
        return done(null, getUserById(id)) 
    })
}