# movie_api
 https://cinenotesmovieapp.herokuapp.com/
 
 Welcome to the movie_api for the MyFlix Web app! MyFlix fetches data about it's users and movies from this API!
 
 This website showcases the projects and skills I have learned while progressing through CareerFoundry's Full-Stack Web Development course! 
 In this app, we learned how to build our own API and host it on Heroku!
## Fetch Methods
### get - director details()
https://cinenotesmovieapp.herokuapp.com/movies/directors/:Name

Source: index.js, line 89 
### get - genre details()
https://cinenotesmovieapp.herokuapp.com/genres/:Name

Source: index.js, line 79 
### get - list of Movies()
https://cinenotesmovieapp.herokuapp.com/movies

Source: index.js, line 49 
### get - list of users()
https://cinenotesmovieapp.herokuapp.com/users

Source: index.js, line 59 
### get - single movie details()
https://cinenotesmovieapp.herokuapp.com/movies/:Title

Source: index.js, line 69 
### post - add favorite to user's list()
https://cinenotesmovieapp.herokuapp.com/users/:Username/favorites/:MovieID

Source: index.js, line 163 
### post - add new user()
https://cinenotesmovieapp.herokuapp.com/users

Source: index.js, line 99 
### put - update user data()
https://cinenotesmovieapp.herokuapp.com/users/:Username

Source: index.js, line 133
### delete - delete favorite from user's list()
https://cinenotesmovieapp.herokuapp.com/movies/users/:Username/favorites/:MovieID

Source: index.js, line 188
### delete - delete user from database()
https://cinenotesmovieapp.herokuapp.com/users/:Username

Source: index.js, line 213 

## Dependencies
Javascript

Passport-JWT

Mongoose (MongoDB)

Express