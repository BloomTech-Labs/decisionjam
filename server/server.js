const bodyParser = require("body-parser");
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const User = require("./db/UserModel.js");
const Decision = require("./db/DecisionModel.js");
const cors = require("cors");
const Billing = require("./db/BillingModel.js");

const jwt = require("jwt-simple");
const passport = require("passport");
const config = require("./config/passport.js");

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;
const STATUS_OKAY = 200;
const STATUS_NOT_FOUND = 404;

server.use(cors());
server.use(bodyParser.json());

server.use(passport.initialize());
// pass passport for configuration
require("./config/passport")(passport);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
const payments = require("./Payments.js");
payments(server);

server.get("/", function(req, res) {
  res.status(200).json({ message: "API running" });
});

server.get("/api/users", passport.authenticate("jwt", { session: false }), function(req, res) {
  User.find({}, (err, users) => {
    if (err) {
      res.status(STATUS_USER_ERROR).json({ error: "Could not find the user." });
    } else {
      res.status(STATUS_OKAY).json(users);
    }
  });
});

server.post("/api/users/adduser", function(req, res) {
  const newUser = new User(req.body);
  //check the user contains all required data
  if (!newUser.username || !newUser.password || !newUser.email) {
    res.status(400).json({ error: "Missing required information" });
    return;
  }
  newUser.save((err, user) => {
    if (err) {
      if (err.name === "BulkWriteError") {
        res
          .status(STATUS_USER_ERROR)
          .json({ error: "Username already exists.", err });
      } else if (err.name === "ValidationError") {
        res.status(STATUS_USER_ERROR).json({
          error: "Password must be at least 8 characters.",
          err
        });
      } else {
        res
          .status(STATUS_USER_ERROR)
          .json({ error: "Error while adding", err });
      }
    } else {
      res.status(STATUS_OKAY).json(user);
    }
  });
});

server.post('/api/decision/create',passport.authenticate("jwt", { session: false }), function(req, res) {
  const newDecision = new Decision (req.body);
  let decisionCode = 'feck';
  console.log(decisionCode);
  let decisionCodeDupe = true;

  //while (decisionCodeDupe) {  // i need to get this working so that it loops 
       //keeps generating a code until there is no match on the database. while
       // while loops don't work with async findOne callback/promises as the while loop
       // will always keep running and get priority over the async code but there must be
       // a common solution for this as the general pattern i'm trying to cover is very common
       // just have to match it into node async way of doing things
    //getUser(Math.random().toString(36).substr(2, 5));
    console.log('in loop');
    //decisionCodeNotUnique = true;
    console.log(decisionCodeDupe);
  //}
    Decision.findOne( {decisonCode : decisionCode = Math.random().toString(36).substr(2, 5)}, function (err, result) {
      if (err) { 
        console.log('in err');
        //res.status(STATUS_USER_ERROR).json({error: "Error while adding", err});
      }
      if (result) {
        console.log('got a duplicate code server should be setup to generate another code');
        
      } else {
        console.log('code must be unique');
        console.log(decisionCodeDupe);
        decisionCodeDupe = false;
        console.log(decisionCodeDupe);
      }
    })
  
  //}

  
  
  newDecision.decisionCode = decisionCode;
  console.log(decisionCode);
  //check the user contains all required data
  newDecision.save((err, decision) => {
      if(err) {
          res.status(STATUS_USER_ERROR).json({error: "Error while adding"});
      } else {
          res.status(STATUS_OKAY).json({decision: decision});
      }
  })
})

server.get('/api/decision/:id',passport.authenticate("jwt", { session: false }), function(req, res) {
  const id = req.params.id;
  console.log("id", id);
  Decision.find({ _id: id }).then(
    decision => {
      res.status(STATUS_OKAY).json(decision);
      console.log("decision", decision);
    },
    err =>
      res
        .status(STATUS_NOT_FOUND)
        .json({ error: "Decision with id " + id + " not found" })
  );
});

// postman test example localhost:8000/api/decision/decisionCode/k65gy
server.get('/api/decision/decisionCode/:decisionCode', function(req, res) {
  const decisionCode = req.params.decisionCode
  console.log(decisionCode);
  Decision.find({decisionCode: decisionCode})
          .then ((decision) => res.status(STATUS_OKAY).json(decision),
                 (err) => res.status(STATUS_NOT_FOUND).json({error: "Decision with code " + decisionCode + " not found"}));
});

server.put('/api/decision/:id/answer', function(req,res) {
  const id = req.params.id;
  console.log(`req.body ${req.body.answer}`);
  
  const answer = req.body.answer; //TODO add with the user id right now only string
  //check if string answer is empty or null
  // https://stackoverflow.com/questions/154059/how-do-you-check-for-an-empty-string-in-javascript
  if (!answer) {
    console.log('answer is blank or undefined');
    res
        .status(STATUS_USER_ERROR)
        .json({ error: "Answer cannot be blank" });
  } else {
    console.log(answer);
    Decision.findOne({ _id: id }).then(
      decision => {
        let answers = decision.answers;
        if (answers === undefined) {
          answers = [{ answerText: answer }];
        } else {
          answers.push({ answerText: answer });
        }
        Decision.updateOne({ _id: id }, { $set: { answers: answers } }).then(
          result => res.status(STATUS_OKAY).json(decision),
          err =>
            res.status(STATUS_NOT_FOUND).json({
              error: "Decision with id " + id + " not updated" + " " + err
            })
        );
      },
      err =>
        res
          .status(STATUS_NOT_FOUND)
          .json({ error: "Decision with id " + id + " not found" })
    );
  }
 
});

server.put(
  "/api/decision/answer/:id/vote",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    const answerId = req.params.id;
    const vote = req.query.vote;
    const userId = req.user.username;
    if (
      vote === undefined ||
      (vote.toUpperCase() !== "YES" && vote.toUpperCase() !== "NO")
    ) {
      res
        .status(STATUS_USER_ERROR)
        .json({ error: "Decision must be yes or no" });
    } else {
      Decision.findOne({ "answers._id": answerId })
        .then(
          decision => {
            let answers = decision.answers;
            const voteForAnswer = answers.find(x => String(x._id) === answerId);
            const upVotes = voteForAnswer.upVotes;
            const downVotes = voteForAnswer.downVotes;
            var voted = false;
            if (
              vote.toUpperCase() === "YES" &&
              upVotes.find(x => x === userId) === undefined
            ) {
              upVotes.push(userId);
              voted = true;
            } else if (
              vote.toUpperCase() === "NO" &&
              downVotes.find(x => x === userId) === undefined
            ) {
              downVotes.push(userId);
              voted = true;
            }
            if (voted) {
              decision
                .save()
                .then(
                  d => res.status(STATUS_OKAY).json(d),
                  err => res.status(STATUS_SERVER_ERROR).json({ error: err })
                );
            } else {
              res.status(STATUS_OKAY).json({
                status: "User already voted not allowed to vote again"
              });
            }
          },
          err =>
            res
              .status(STATUS_NOT_FOUND)
              .json({ error: "answer with id " + answerId + " not found" })
        )
        .catch(e => console.log(e));
    }
  }
);

//gotta convert ugly callback code to beautiful promises
//http://erikaybar.name/using-es6-promises-with-mongoosejs-queries/
// route to authenticate a user (POST http://localhost:8080/api/login)
server.post("/api/login", function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ error: "Missing required information" });
    return;
  }
  User.findOne(
    {
      $or: [{ email: req.body.email }, { username: req.body.username }]
    },
    function(err, user) {
      console.log("err:", err);
      if (err) throw err;
      if (!user) {
        res.json({
          success: false,
          msg: "Authentication failed. User not found."
        });
      } else {
        // check if password matches
        console.log(user.password, req.body.password);
        user.comparePassword(req.body.password, function(err, isMatch) {
          console.log(isMatch);
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.encode(user, "cs5Rocks");
            // return the information including token as JSON
            Billing.findOne({ username: req.body.username })
              .sort({ subscriptionID: -1 })
              .then((subscription, err) => {
                // console.log('subscription', subscription, 'err', err);
                if (!subscription) {
                  res.json({
                    success: true,
                    token: "JWT " + token,
                    subscriptionID: false
                  });
                } else {
                  res.json({
                    success: true,
                    token: "JWT " + token,
                    subscriptionID: subscription.subscriptionID
                  });
                }
              });
          } else {
            res.json({
              success: false,
              msg: "Authentication failed. Username or password is incorrect. ",
              err
            });
          }
        });
      }
    });
  });

  /* Handle Logout */ 
  //see last comment https://stackoverflow.com/questions/45541182/passport-req-logout-function-not-working 
server.get('/api/logout', passport.authenticate('jwt', { session: false }),function(req, res) {
  console.log("I am Logout")
  req.logout(); 
  res.status(200).redirect('/');
});

//how to setup routes that need auth as well as test it on postman
//https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/
server.get(
  "/api/routeThatNeedsJWTToken",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    res.json({
      "Success! You can not see this without a token": "bla",
      user: req.user
    });
  }
);

mongoose.Promise = global.Promise;
const connect = mongoose.connect("mongodb://localhost/decisionjam");
//  'mongodb://sneha.thadani:decisionjam@ds163769.mlab.com:63769/decisionjam');

connect.then(
  () => {
    const port = 8000;
    server.listen(port);
    console.log(`Server Listening on ${port}`);
  },
  err => {
    console.log("could not connect to MongoDB");
  }
);
