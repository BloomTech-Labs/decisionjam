const bodyParser = require('body-parser');
const express = require ('express');
const server = express();
const mongoose = require('mongoose');
const User = require('./db/UserModel.js');
const cors = require('cors');

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;
const STATUS_OKAY = 200;

server.use(cors());
server.use(bodyParser.json());


server.get ('/', function (req, res) {
   res.status(200).json ({message: 'API running'});
});

server.get ('/api/users', function (req, res) {
  User.find({},(err, users)=> {
        if (err) {
        res.status(STATUS_USER_ERROR).json({error:'Could not find the user.'});
        } else {
            res.status(200).json(users);
        }
  })
});

server.post('/api/users/adduser', function(req, res) {
    const newUser = new User (req.body);
    //check the user contains all required data
    newUser.save((err, user) => {
        if(err) {
            res.status(STATUS_USER_ERROR).json({error: "Error while adding"});
        } else {
            res.status(200).json(user);
        }
    })
});

mongoose.Promise = global.Promise;
const connect = mongoose.connect(
   'mongodb://sneha.thadani:decisionjam@ds163769.mlab.com:63769/decisionjam');

connect.then(()=> {
   const port= 8000;
   server.listen(port);
   console.log(`Server Listening on ${port}`);
}, (err)=> {
   console.log('could not connect to MongoDB');
});