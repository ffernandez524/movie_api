//Import Node modules
const express = require('express');
const bodyParser = require('body-parser');

const morgan = require('morgan');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

const fs = require('fs');
const path = require('path');



//Mongoose
mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
});

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Import auth.js
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(morgan("common"));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

// Log requests to log.txt
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

// Logs errors that occur to the console
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//GET requests
//Display default greeting
app.get('/', (req, res) => {
  res.send('Welcome to Cinenotes!');
});

//GET List of Movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find().then ((movies) => { 
    res.status(201).json(movies);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//GET data of a single movie
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title : req.params.Title }).then(movie => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });    
});

//GET Description of a genre
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name' : req.params.Name }).then(movie => {
    res.status(201).json(movie.Genre);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//GET Director Data (IMDB)
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name' : req.params.Name }).then(movie => {
    res.status(201).json(movie.Director);
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//POST New User
app.post('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + " already exists!");
    } else {
      Users.create( {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      }).then((user) => {
        res.status(201).json(user);
      }).catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
    }
  });
});

//PUT Update information of user
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:      
      {
        Username: req.body.Username,
        Password: req.body.Password,
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

//Post Add movie to user's favorites
app.post('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

//DELETE Remove movie from favorites
app.delete('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

//DELETE Deregister user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

// listen for requests
app.listen(8080, () => {
  console.log('Cinenotes listening on port 8080.');
});