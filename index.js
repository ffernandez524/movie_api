const express = require('express');
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const fs = require('fs');
const path = require('path');

/** @function moongoose - connect to MongoDB */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
});

/** @function app - parse html body JSON */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** @function cors - limit who can use the API */
const cors = require('cors');
app.use(cors());

/** @function auth - JWT Authentication token */
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/** @function morgan - log data to log.txt */
app.use(morgan("common"));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

// Log errors to console
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// default greeting 
app.get('/', (req, res) => {
  res.send('Welcome to Cinenotes!');
});

/** @function get - list of Movies */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find().then ((movies) => { 
    res.status(201).json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/** @function get - list of users */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find().then ((users) => { 
    res.status(201).json(users);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/** @function get - single movie details */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title : req.params.Title }).then(movie => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });    
});

/** @function get - genre details */
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name' : req.params.Name }).then(movie => {
    res.status(201).json(movie.Genre);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/** @function get - director details */
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name' : req.params.Name }).then(movie => {
    res.status(201).json(movie.Director);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** @function post - add new user */
app.post('/users',
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + " already exists!");
    } else {
      Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      })
      .then((user) => { res.status(201).json(user);})
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
    }
  });
});

/** @function put - update user data */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }  
  
  let hashedPassword = Users.hashPassword(req.body.Password)
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:      
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      }
    },
    { new: true }).then((updatedUser) => {
      res.status(201).json(updatedUser);
    }).catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

/** @function post - add favorite to user's list */
app.post('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }),
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }  
  
  Users.findOneAndUpdate({ Username: req.params.Username }, { $push:      
    {
      Favorites: req.params.MovieID
    }
  },
  { new: true }).then((updatedUser) => {
    if(updatedUser){
      res.status(201).json(updatedUser);
    } else {
      res.status(500).send("Error occurred updating user.");
    }
  })  
});

/** @function delete - delete favorite from user's list */
app.delete('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }),
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric()
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }  
  
  Users.findOneAndUpdate({ Username: req.params.Username }, { $pull: 
    { 
      Favorites: req.params.MovieID 
    }
  },
  { new: true }).then((updatedUser) => {
    if(updatedUser){
      res.status(201).json(updatedUser);
    } else {
      res.status(500).send("Error occurred updating user.");
    }
 });
});

/** @function delete - delete user from database */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), 
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric()
], (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }  
  
  Users.findOneAndRemove({ Username: req.params.Username }).then((user) => {
    if (user) {
      res.status(201).send('User ' + req.params.Username + ' has been deleted.');
    } else {
      res.status(404).send('User ' + req.params.Username + ' not found.');
    }
  }).catch((err) => {
      console.error(err);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Cinenotes listening on port ' + port);
});