const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    // Verification token document will automatically delete itself after 12 hours
    expires: 43200
  }
});

const tokenModel = mongoose.model('token', tokenSchema);
module.exports = tokenModel;
