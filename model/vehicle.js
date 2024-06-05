const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true
  },
  vehicleModel: {
    type: String,
    required: true
  },
  vehicleMake: {
    type: String,
    required: true
  },
  vehicleYear: {
    type: Number,
    required: true,
    min: 1990, 
    max: new Date().getFullYear()
  },
  user_Id: {
    type: String,
    required: true
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
