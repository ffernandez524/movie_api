const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + ' ' + password);
    Users.findOne({ Username: username }).then((user) => {
        if (!user) {
            console.log('incorrect username');
            return callback(null, false, {message: 'Incorrect username or password.'});
        } if (!user.validatePassword(password)) {
            console.log('Incorrect Password');
            return callback(null, false, {message: 'Incorrect Password.'});
        }
        console.log('finished');
        return callback(null, user);                
    });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id).then((user) => {
        return callback(null, user);
    }).catch((error) => {
        return callback(error)
    });
}));