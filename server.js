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

var questionsPerGame = 5;

// return a random permutation of a range (similar to randperm in Matlab)
function randperm(maxValue){
    // first generate number sequence
    var permArray = new Array(maxValue);
    for(var i = 0; i < maxValue; i++){
        permArray[i] = i;
    }
    // draw out of the number sequence
    for (var i = (maxValue - 1); i >= 0; --i){
        var randPos = Math.floor(i * Math.random());
        var tmpStore = permArray[i];
        permArray[i] = permArray[randPos];
        permArray[randPos] = tmpStore;
    }
    return permArray;
}


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
    
    dbo.collection("Rooms").find( {}).toArray(function (err,allrooms){
		//console.log(allrooms)
		  res.render('rooms', {rooms: allrooms});
		  
	  });

  });
  
  
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.get('/register',
  function(req, res){
    res.render('register');
  });
  
app.get('/stats', surelogin.ensureLoggedIn(), function(req, res){
	dbo.collection("Users").find({}).toArray(function(err, alluser){
		var users = []
		alluser.forEach(user => {
			score = user.score.easy * 1.0 + 
					user.score.medium * 1.4 +
					user.score.hard * 2.0;
			users.push({username: user.username, score: parseInt(score)})
		});
		users.sort(function(a, b){
			return b.score-a.score
		})
		res.render('stats', {users: users});
	})
})
  
app.get('/help',
  surelogin.ensureLoggedIn(),
  function(req, res){
    res.render('help');
  });
  
app.post('/register',
  
  function(req, res) {
	  
	  var age = req.body.age
	  
	  var group
	  
	  if(0 <= age && age <= 9) {
		  group = 1;
	  }
	  
	  if(10 <= age && age <= 17) {
		  group = 2;
	  }
	  
	  if(18 <= age && age <= 30) {
		  group = 3;
	  }
	  
	  if(31 <= age && age <= 50) {
		  group = 4;
	  }
	  
	  if(51 <= age) {
		  group = 5;
	  }
	  
	  var scores = {easy: 0, medium: 0, hard: 0}
	  
	  dbo.collection("Users").insertOne({
						username: req.body.username,
						password: req.body.password,
						agegroup: group,
						answers: [],
						score: scores,
						}
						
					);
    res.redirect('/');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
	  dbo.collection("Rooms").update( { state: { $in: ["Várakozik"]}},  { "$pull": { users: req.user.username }})
	  dbo.collection("Rooms").update( { state: { $in: ["Várakozik"]}},  { "$pull": { users: req.user.username }})
    res.redirect('/');
  });

app.get('/logout',
  surelogin.ensureLoggedIn(),
  function(req, res){
	  dbo.collection("Rooms").update( { state: { $in: ["Várakozik"]}},  { "$pull": { users: req.user.username }})

    req.logout();
    res.redirect('/login');
  });
  
app.get('/deleteprofile',
  surelogin.ensureLoggedIn(),
  function(req, res){
	  
	userToDelete = req.user.username

    req.logout();
    
    
    dbo.collection("Users").deleteOne( { username: userToDelete  })
    
    
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

app.get('/create_new', surelogin.ensureLoggedIn(), function(req, res){
		dbo.collection("Rooms").findOne( {$and: [{state: {$in: ["Várakozik", "Játékban"]}}, {$or: [{users: req.user.username}, {name: req.query.roomname}]}]}, function(err, room){
			if (!room){
				dbo.collection("Questions").aggregate({ $sample : { size : questionsPerGame }}, { $match : { difficulty : parseInt(req.query.difficulty) }}).toArray(function (err, random5){
					dbo.collection("Rooms").insertOne({
						difficulty: req.query.difficulty,
						name: req.query.roomname,
						playercount: parseInt(req.query.playercount),
						state: "Várakozik",
						users: [],
						questions: random5,
						answers: Array(questionsPerGame).fill({}),
						current: 0 }
						, function(err, result) {
							if (err) throw err;
							joinRoom(req.user.username, result.insertedId);
							res.redirect('/room');
						}
					);
				});	
			} else res.redirect('/room');
		});
		
	}
);

function joinRoom(username, roomId){
	dbo.collection("Rooms").updateMany( {state : 'Várakozik'}, { $pull: { users: username } }) //Minden várakozó szobából kivesz
	dbo.collection("Rooms").update( {_id: ObjectId(roomId)}, { $push: { users: username } }) //Hozzáadás a szobához
}

app.get('/join', surelogin.ensureLoggedIn(), function(req, res){
	  var id = req.query.id;
	  dbo.collection("Rooms").findOne( {_id: ObjectId(id) }, function(err, room) {
		  if(room.users.length < room.playercount) {
				joinRoom(req.user.username, id)
			}
		});

		dbo.collection("Rooms").findOne( {_id: ObjectId(id) }, function(err, room) {
			console.log(room.users.length)
			console.log(room.playercount)

			if(room.users.length == room.playercount-1) {
				dbo.collection("Rooms").update( {_id: ObjectId(id)},  { $set: { state: "Játékban" }}) //szoba frissites, jatek inditas
			};
		});
		res.redirect('/room');
  }
);

app.get('/leave', surelogin.ensureLoggedIn(), function(req, res){
	dbo.collection("Rooms").update( { _id: ObjectId(req.query.roomid)},  { "$pull": { users: req.user.username }}, function(err, result){
		res.redirect('/');
	});
});

app.get('/room', surelogin.ensureLoggedIn(), function(req, res){

	dbo.collection("Rooms").findOne( { $and: [{state: {$in: ["Várakozik", "Játékban"]}}, {users: req.user.username}]}, function(err, room) {
		

		if (!room) return res.redirect('/'); // If the player is not in any active game, go to homepage
		if (room.state == "Játékban") return res.redirect('/game'); // If the player is in a running game, go to that game
		console.log(room._id)
		res.render('waiting_room', {roomid: room._id});
	});
});

app.get('/room/update', surelogin.ensureLoggedIn(), function(req, res){
	dbo.collection("Rooms").findOne( { $and: [{state: {$in: ["Várakozik", "Játékban"]}}, {users: req.user.username}]}, function(err, room) {
		if (room.state == "Várakozik") return res.render('name_table', {room_obj: room});

		res.send({redirect: '/game'});
	});
})

app.get('/game', surelogin.ensureLoggedIn(), function(req, res){
	  dbo.collection("Rooms").findOne( {state: "Játékban"},  {users: req.user.username}, function (err,room){
			if (!room) {
				dbo.collection("Rooms").findOne( {state: "Befejezve"},  {users: req.user.username}, function (err,closeroom){
						
						if(closeroom) {
							console.log("closing room:")
							console.log(closeroom)
							console.log(closeroom.answers[0].btamas)
							
							var i;
							for (i = 0; i < closeroom.questions.length; i++) {
								var j;
								for (j = 0; j < closeroom.users.length; j++) {
									console.log(closeroom.users[j])
									var user = closeroom.users[j]
								
									if(closeroom.answers[i][user] == 0) {
										console.log('good answer')
										if(closeroom.questions[i].difficulty == 1) {
											console.log('easy')
											dbo.collection("Users").update( {username: user}, {$inc: {'score.easy': 1}});
										}
										
										if(closeroom.questions[i].difficulty == 2) {
											console.log('medium')
											dbo.collection("Users").update( {username: user}, {$inc: {'score.medium': 1}});
										}
										
										if(closeroom.questions[i].difficulty == 3) {
											console.log('hard')
											dbo.collection("Users").update( {username: user}, {$inc: {'score.hard': 1}});
										}
										
									}
								}
							}
							
							dbo.collection("Rooms").deleteOne( {_id: ObjectId(closeroom._id)})
						}
						
				}); 
				dbo.collection("Rooms").find( {}).toArray(function (err,allrooms){
					res.render('rooms', {rooms: allrooms});
				  
				});
			} else {
				order = randperm(4)
				res.render('question', {question: room.questions[room.current], ordering: order})
			}
	  }); 
	  
	  
});

app.get('/game/answer', surelogin.ensureLoggedIn(), function(req, res){
	dbo.collection("Rooms").findOne( {state: "Játékban"},  {users: req.user.username}, function(err, result){
		if(result){
			dbo.collection("Rooms").update( {_id: ObjectId(result._id)}, {$set: {["answers."+String(result.current)+"."+req.user.username]: req.query.n}});
			dbo.collection("Rooms").findOne( {state: "Játékban"},  {users: req.user.username}, function(err, room){
				if ( (Object.keys(room.answers[room.current]).length == room.playercount ) && room.current < questionsPerGame){
					dbo.collection("Rooms").update( {_id: ObjectId(result._id)}, {$inc: {current: 1}});
					
					if ( room.current >= questionsPerGame-1 ){
						dbo.collection("Rooms").update( {_id: ObjectId(result._id)},  { $set: { state: "Befejezve" }})
						console.log("jatek befejezve")
					}
				}
			});
		}
	});
	res.redirect('/game')
})

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
});
