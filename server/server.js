const bodyParser = require('body-parser');
const express = require ('express');
const server = express();
const mongoose = require('mongoose');
const User = require('./db/UserModel.js');


server.get ('/', function (req, res) {
    res.status(200).json ({message: 'API running'});
});

server.get ('/users', function (req, res) {
   User.find({},(err, users)=> {
       if (err) {
        res.status(401).json({error:'Something went wrong, please try again'});
       } else {
           res.status(200).json(users);
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


