#!/usr/bin/env nodejs


var express = require('express');
var favicon = require('serve-favicon')
var path = require('path')
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var url = "mongodb://localhost:27017/QuizApp";

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(
	new Strategy(
		function(username, password, cb) {
			
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				//console.log("Database connection created!");
				var dbo = db.db("QuizApp");
	  
				dbo.collection("Users").findOne( {'username': username}, function(err, user) {
					console.log(user);
					if (err) { return cb(err); }
					if (!user) { return cb(null, false); }
					if (user.password != password) { return cb(null, false); }
					return cb(null, user);
			
					db.close();
				});
  
			});
		})
  
 );


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
	
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		console.log("Database connection created!");
		var dbo = db.db("QuizApp");
	  
	  
		dbo.collection("Users").findOne( {'_id': ObjectId(id) }, function(err, user) {
			console.log(id)
			console.log(user)
			if (err) { return cb(err); }
			cb(null, user);
			
			db.close();
		});
  
	});

});

var app = express();
app.use(favicon(path.join(__dirname, 'favicon.ico')))

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.set('json spaces', 2);



fileSystem = require('fs'),
path = require('path');


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connection created!");
  var dbo = db.db("QuizApp");
  //var myobj = { question: "Menyi 2x2?", answers: ["4", "néha 5", "mindig 5", "3"], difficulty: 1, tags: ["vicc", "teszt"] };
  //dbo.collection("Questions").insertOne(myobj, function(err, res) {
    //if (err) throw err;
    //console.log("1 document inserted");
  db.close();
//});
  
});

const requestHandler = (request, response) => {
  console.log(request.url)
  
}

// Define routes.
app.get('/', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    var filePath = path.join(__dirname, 'task.txt');
    var stat = fileSystem.statSync(filePath);


    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    var readStream = fileSystem.createReadStream(filePath, encoding='utf-8');
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/login');
  });



app.get('/questions',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    //res.setHeader("Content-Type", "application/json; charset=utf-8");

	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		console.log("Database connection created!");
		var dbo = db.db("QuizApp");
	  
		dbo.collection("Questions").find({}).toArray(function(err, result) {
			if (err) throw err;
			res.json(result);
			db.close();
		});
  
	});
});
    
var server = app.listen(8080, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

