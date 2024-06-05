const mongoose = require('mongoose');

// Define the appointment schema
const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  services: {
    type: [String],
    required: true,
    enum: ['Full Service', 'Oil Change', 'Tire Rotation', 'Brake Service'], // Allowed values
  },
  vehicle: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  user_Id: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});


const serviceAppointment = mongoose.model('Service-Appointment', appointmentSchema);

module.exports = serviceAppointment;
