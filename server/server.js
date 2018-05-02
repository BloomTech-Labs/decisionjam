const bodyParser = require('body-parser');
const express = require ('express');
const server = express();
const mongoose = require('mongoose');
const User = require('./db/UserModel.js');

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;
const STATUS_OKAY = 200;

server.get ('/', function (req, res) {
    res.status(STATUS_OKAY).json ({message: 'API running'});
});

server.get ('/users', function (req, res) {
   User.find({},(err, users)=> {
       if (err) {
        res.status(STATUS_USER_ERROR).json({error:'Something went wrong, please try again'});
       } else {
           res.status(STATUS_OKAY).json(users);
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


