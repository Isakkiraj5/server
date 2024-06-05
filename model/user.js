const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
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
  mobile: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'],
  },
});

// Create and export the user model
const User = mongoose.model('User', userSchema);

module.exports = User;
