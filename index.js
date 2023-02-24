//Import Node modules
const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(bodyParser.json());


let users = [
  {
    id: "4897",
    username: 'testuser',
    favorites: ['Battlestar Galactica'],
    name: 'John Doe',
    email: 'jd@gmail.com',
    bio: 'I like movies',
    dob: '4/19/1965'
  }
]

let movies = [
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

let genres = [
  {
    name: "action",
    description: "Movies in the action genre contain fast-paced scenes depicting exciting events.",
  }
];

let directors = [
  {
    name: "Joss Whedon",
    bio: "Movies in the action genre contain fast-paced scenes depicting exciting events.",
    birth_year: 1964,
    death_year: "n/a"  
  }
];

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
app.get('/movies', (req, res) => {
  res.json(movies);
});

//GET data of a single movie
app.get('/movies/:title', (req, res) => {
  res.json(movies.find( (movie) =>
  { return movie.title === req.params.title }));
});

//GET Description of a genre
app.get('/genres/:name', (req, res) => {
  res.json(genres.find( (genre) =>
  { return genre.name === req.params.name }));
});

//GET Director Data (IMDB)
app.get('/directors/:name', (req, res) => {
  res.json(directors.find( (director) =>
  { return director.name === req.params.name }));
});

//POST New User
app.post('/users', (req, res) => {
  let newUser = req.body;
  
  if (!newUser.name) {
    const message = 'Missing "name" in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);       
  }
});

//PUT Update username of user by ID
app.put('/users/:id', (req, res) => {
  let user = users.find((user) => { return user.id === req.params.id });
  let update = req.body;

  if (user) {
    user.username = update.username;
    res.status(201).send('User ' + user.name + '\'s username updated to ' + update.username);
  } else {
    res.status(404).send('Username ' + update.username + ' not found.');
  }
});

//PUT Add movie to user's favorites by username
app.put('/users/:username/favorites/:movie', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });

  if (user) {
    user.favorites.push(req.params.movie);
    res.status(201).send(req.params.movie + ' has been added to ' + user.name + '\'s list of favorite movies!');
  } else {
    res.status(404).send('Username ' + req.params.username + ' not found.');
  }
});

//DELETE Remove movie from favorites by username
app.delete('/users/:username/favorites/:movie', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });

  if (user) {
    user.favorites = user.favorites.filter((str) => { return str !== req.params.movie });
    console.log(user);
    res.status(201).send(req.params.movie + ' has been removed from ' + user.name + '\'s list of favorite movies.');
  } else {
    res.status(404).send('Username ' + request.params.username + ' not found.');
  }
});

//DELETE Deregister user by ID
app.delete('/users/:id', (req, res) => {
  let user = users.find((user) => { return user.id === req.params.id });

  if (user) {
    users = users.filter((obj) => { return obj.id !== req.params.id });
    console.log(users);
    res.status(201).send('User ' + req.params.id + ' has been deleted.');
  } else {
    res.status(404).send('Username ' + request.params.username + ' not found.');
  }
});

// listen for requests
app.listen(8080, () => {
  console.log('Cinenotes listening on port 8080.');
});