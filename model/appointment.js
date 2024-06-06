const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  services: {
    type: [String],
    required: true,
    enum: ['Full Service', 'Oil Change', 'Tire Rotation', 'Brake Service'], 
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
  },
  paymentMethod: {
    type: String,
    required: true
  }
});

appointmentSchema.index({ vehicle: 1, date: 1 }, { unique: true });

const serviceAppointment = mongoose.model('Service-Appointment', appointmentSchema);

module.exports = serviceAppointment;
