//This is the process for user authentication.


var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var session = require('express-session');
var parseurl = require('parseurl');


var app = express();

//registered users
const users = [
  {'username': 'faith', 'password': 'puppies'},
  {'username':'dan', 'password':'123456'},
  {'username':'joel', 'password': 'safepass'},

];

//view engine
app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

//app.use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'shhhh',
  resave: false,
  saveUnitialized: true

}));
/**
*Middleware to require user to be logged in
*
* Does a redirect to the **/
app.use(function(req, res, next){
  var pathname = parseurl(req).pathname;

  if(!req.session.user && pathname != '/login'){
    res.redirect('/login?next=' + pathname);
  }else{
    next();
  }
});

app.use(function(req, res, next){
  var views = req.session.views;

  if(!views){
    views = req.session.views = {};
  }

var pathname = parseurl(req).pathname;

views[pathname] = (views[pathname] || 0) + 1;
next();
});

app.get('/login', function(req, res){

  var context = {
    next: req.query.next
  };
    res.render('login', context);
  if(req.session.user){
    res.redirect('/welcome');
  }
});

app.get('/login', function(req, res){
  var context = {
    'username' : req.session.user.username,
    'views' : req.session.views['/']
  };
  res.render('index', context);
});



app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var nextPage = req.body.next;

  var person = users.find(function(user){
    return user.username == username;
  });
  if(person && person.password == password){ //checking for valid login
    req.session.user = person;
  }else if(req.session.user) {
    delete req.session.user;
  }
  if(req.session.user){
    res.redirect('/welcome'); //user will be sent to welcom screen if login is valid
  }else{
    res.redirect('/login');
  }
});

app.get('/welcome', function(req, res){
  res.send("Welcome to my site " + req.session.user.username + " !");
});
app.listen(3000);
console.log('Application has been initialized');
