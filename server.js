#!/usr/bin/env nodejs


var express = require('express');
var favicon = require('serve-favicon')
var path = require('path')
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var surelogin = require('connect-ensure-login')

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017/QuizApp";

var dbo;

MongoClient.connect(url, function(err, db) {
	dbo = db.db("QuizApp");
});

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
					//console.log(user);
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
		var dbo = db.db("QuizApp");


		dbo.collection("Users").findOne( {'_id': ObjectId(id) }, function(err, user) {
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
  var dbo = db.db("QuizApp");
  db.close();
//});

});

const requestHandler = (request, response) => {
  //console.log(request.url)

}

// Define routes.
app.get('/',
  surelogin.ensureLoggedIn(),
  function(req, res) {

    //var filePath = path.join(__dirname, 'task.txt');
    //var stat = fileSystem.statSync(filePath);
    //res.setHeader("Content-Type", "text/plain; charset=utf-8");
    //var readStream = fileSystem.createReadStream(filePath, encoding='utf-8');
    // We replaced all the event handlers with a simple call to readStream.pipe()
    //readStream.pipe(res);

    dbo.collection("Rooms").find( {}).toArray(function (err,allrooms){
		//console.log(allrooms)
		  res.render('rooms', {rooms: allrooms});

	  });

  });


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/game',
  surelogin.ensureLoggedIn(),
  function(req, res){


	  dbo.collection("Questions").find( {'difficulty': 3, 'tags': 'multiplication'}).toArray(function (err,questions){
		  nr = questions.length
		  random = getRandomInt(0,nr)
		  resp = questions[random]
		  //console.log(resp)
		  res.json(resp);


	  });

    //res.render('game');
});

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/stats',
  surelogin.ensureLoggedIn(),
  function(req, res){
    res.render('stats');
  });

app.get('/help',
  surelogin.ensureLoggedIn(),
  function(req, res){
    res.render('help');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
	  dbo.collection("Rooms").update( {"_id": ObjectId(req.user.room)},  { "$pull": { users: req.user.username } })
	  dbo.collection("Users").update( {"_id": ObjectId(req.user._id)},  { "$set": {"room": null }})
    res.redirect('/');
  });

app.get('/logout',
  surelogin.ensureLoggedIn(),
  function(req, res){
	  dbo.collection("Rooms").update( {"_id": ObjectId(req.user.room)},  { "$pull": { users: req.user.username } })
	  dbo.collection("Users").update( {"_id": ObjectId(req.user._id)},  { "$set": {"room": null }})
    req.logout();
    res.redirect('/login');
  });

app.get('/profile',
	surelogin.ensureLoggedIn(),
  function(req, res){

    res.render('profile', {user: req.user});
  }
);

app.get('/gameid',
	surelogin.ensureLoggedIn(),
  function(req, res){

	   dbo.collection("Rooms").findOne( {"_id": ObjectId(req.user.room) }, function(err, room) {

		   if(room) {

				dbo.collection("Games").findOne( {"_id": ObjectId(room.game) }, function(err, game) {

					if(game) {
						res.json(game._id);
					} else {
						res.json(null);
					}
				});

		  } else {
			  res.json(null);
		  }
	   });

    //res.render('profile', {user: req.user});
  }
);

app.get('/join',
	surelogin.ensureLoggedIn(),
  function(req, res){
	  var id = req.query.id

	  dbo.collection("Rooms").findOne( {"_id": ObjectId(id) }, function(err, room) {
		  console.log(room.users.indexOf(req.user.username))
		  console.log(req.user.room)
		  if(room.users.length < 4) {
			  var users = room.users
			  if(room.users.indexOf(req.user.username) < 0){ //nincs meg ebben a szobaban

				  if(!req.user.room){ //nincs egy szobaban se

					  dbo.collection("Rooms").update( {"_id": ObjectId(id)},  { "$push": { users: req.user.username } }) //szobahoz adas
					  dbo.collection("Users").update( {"_id": ObjectId(req.user._id)},  { "$set": {"room": id }}) //szoba hozzadas

					  if(room.users.length == 3) { //Ha idaig eljutunk akkor sikeresen belepett a jatekos a szobaba es ha elotte csak 3an voltak a szobaban mostmar tele van. Szoba frissitese, jatek inditasa
						  dbo.collection("Rooms").update( {"_id": ObjectId(id)},  { "$set": {"state": "Játékban" }}) //szoba frissites, jatek inditas

						  dbo.collection("Questions").find( {'difficulty': room.difficulty, 'tags': room.tag}).toArray(function (err,everyQuestion){
							  var questionIDs = [];
							  var userIDs = room.users;
							  userIDs.push(req.user.username);
							  var start = Date.now() ;

							  var i;
								for (i = 0; i < 5; i++) {
									var rand = getRandomInt(0,everyQuestion.length-1)
									//console.log(rand)
									questionIDs.push(everyQuestion[rand]._id)
								}


							  var game = { startTime: start, users: userIDs , questions: questionIDs };
							  //console.log(game)
							  dbo.collection("Games").insertOne(game, function(err, res) {
								  //console.log(game._id)
								  dbo.collection("Rooms").update( {"_id": ObjectId(id)},  { "$set": {"game": game._id }})
								   })

				  });

				  }
				  }
			  }



		  }

	  });



    //res.render('profile', {user: req.user});
  }
);

app.get('/questions',
  surelogin.ensureLoggedIn(),
  function (req, res) {
    //res.setHeader("Content-Type", "application/json; charset=utf-8");

	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		//console.log("Database connection created!");
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
