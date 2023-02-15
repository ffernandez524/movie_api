//Import Node modules
const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

let topMovies = [
  {
    title: 'Guardians of the Galaxy',
    director: 'James Gunn'
  },
  {
    title: 'Lord of the Rings',
    director: 'J.R.R. Tolkien'
  },
  {
    title: 'Glass Onion',
    director: 'Rian Johnson'
  },
  {
    title: 'Star Trek',
    director: 'J.J. Abrams'
  },
  {
    title: 'Rush Hour',
    director: 'Brett Ratner'
  },
  {
    title: 'The Avengers',
    director: 'Joss Whedon'
  },
  {
    title: 'Encanto',
    director: 'Jared Bush and Byron Howard'
  },
  {
    title: 'Puss and Boots 2',
    director: 'Joel Crawford'
  },
  {
    title: 'The Cabin in the Woods',
    director: 'Drew Goddard'
  },
  {
    title: 'Bullet Train',
    director: 'David Leitch'
  }
];

const app = express();
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

//Display Top Movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

  
// listen for requests
app.listen(8080, () => {
  console.log('Cinenotes listening on port 8080.');
});