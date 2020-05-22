import * as express from 'express'
import * as mysql from 'mysql'
import * as config from '../config'

var rankingsRouter = express.Router()

let connection: mysql.Connection = mysql.createConnection({
    host: config.default.server_ip,
    user: config.default.database.user,
    password: config.default.database.password,
    database: config.default.database.name
});

connection.query(`USE ${connection.config.database}`);

function checkAuthenticated(req: any, res: any, next: any) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

rankingsRouter.get('/', checkAuthenticated, (req: any, res: any) => {
    connection.query('SELECT u.id, u.username, us.score, us.rank FROM users u LEFT JOIN userStats us ON u.id = us.userId ORDER BY us.rank DESC', 
     (err, rows) => {
        res.render('rankings.ejs', { 
            name: req.user.username ,
            rankings: rows
        })
    });

})

export default rankingsRouter