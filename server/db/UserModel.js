const mongoose = require ('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,

    },
    choices: [],
    createdOn: {
        type: Date,
        required: true,
        default: Date.now,
    },
    
});
const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;