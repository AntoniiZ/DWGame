import * as bcrypt from 'bcrypt'
import * as mysql from 'mysql'
import * as passportLocal from 'passport-local'
import * as config from '../server/config'

const LocalStrategy = passportLocal.Strategy

let connection: mysql.Connection = mysql.createConnection({
    host: config.default.server_ip,
    user: config.default.database.user,
    password: config.default.database.password,
    database: config.default.database.name
});

connection.query(`USE ${connection.config.database}`);

let databaseScripts: any = config.default.database.scripts
connection.query(databaseScripts.cUsers);
connection.query(databaseScripts.cUserStats);
connection.query(databaseScripts.cUpgrades);
connection.query(databaseScripts.cUserUpgrades);

export default function initialize(passport: any) {

    passport.serializeUser((user: any, done: any) => {
        return done(null, user.id)
    })

    passport.deserializeUser((id: any, done: any) => {
        connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
            done(err, rows[0]);
        });
    })

    passport.use(
        'local-register',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req: any, username: any, password: any, done: any) {
                connection.query("SELECT * FROM users WHERE username = ?",
                    [username],
                    function (err, rows) {
                        if (err)
                            return done(err);

                        if (rows.length) {
                            return done(null, false,
                                req.flash('registerMessage', `The username '${username}' is already taken.`));
                        }
                        if(password.length < 6) {
                            return done(null, false,
                                req.flash('registerMessage', `The password must have 6+ characters`));
                        }

                        let user: any = {
                            username: username,
                            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
                        };
                        let insertQuery: string = 'INSERT INTO users ( username, password ) values (?,?)';

                        connection.query(insertQuery,

                            [user.username, user.password],

                            function (err, rows) {
                                user.id = rows.insertId;
                                return done(null, user);
                            }
                        );
                    }
                );
            })
    );

    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req: any, username: any, password: any, done: any) {
                connection.query("SELECT * FROM users WHERE username = ?",
                    [username],

                    function (err, rows) {
                        if (err)
                            return done(err);

                        if (!rows.length) {
                            return done(null, false, req.flash('loginMessage', `The user '${username}' doesn't exist.`));
                        }
                        if (!bcrypt.compareSync(password, rows[0].password))
                            return done(null, false, req.flash('loginMessage', `Wrong password for '${username}'`));

                        return done(null, rows[0]);
                    }
                );
            }
        )
    );
}