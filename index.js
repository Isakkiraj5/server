const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const app = express();

app.use(cors());
app.use(express.json());

const url = 'mongodb+srv://isakkiraj:Esscooty%407300@cluster0.fdsuknk.mongodb.net/vehiclecare';
const usermodel = require('./model/user');
const serviceAppointment = require('./model/appointment');
const vehicle = require('./model/vehicle');
const port = 3000;

mongoose.connect(url)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    usermodel.findOne({ email: email })
        .then((user) => {
            if (user) {
                if (user.password === password) {
                    console.log('Login successful for:', user.email);
                    res.json({ success: true, userId: user._id });
                } else {
                    console.log('Password is Incorrect for:', user.email);
                    res.json({ success: false, message: "Password is Incorrect" });
                }
            } else {
                console.log('No user exists with email:', email);
                res.json({ success: false, message: "No user exists" });
            }
        })
        .catch((error) => {
            console.error('Error during login:', error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        });
});

app.post('/api/register', (req, res) => {
    usermodel.create(req.body)
        .then((user) => res.json(user))
        .catch((err) => res.json(err));
});

app.post('/api/vehicle', (req, res) => {
    vehicle.create(req.body)
        .then((vehicle) => res.json(vehicle))
        .catch((err) => res.json(err));
});

app.post('/api/appointment', (req, res) => {
  serviceAppointment.create(req.body)
  .then((appointment) => res.json(appointment))
  .catch((err) => res.json(err));
});

app.get('/api/user/:id', async (req, res) => {
const { id: userId } = req.params;
console.log("userId:", userId);

try {
  const userDetail = await usermodel.findById(userId);
  console.log("userDetail", userDetail);
  res.json({ userDetail });
} catch (error) {
  console.error('Error fetching user:', error);
  res.status(500).json({ message: 'Internal Server Error', error });
}
});

app.get('/api/vehicle/:id', async (req, res) => {
try {
  const { id: userId } = req.params;
  console.log("id", userId);
  const userDetail = await vehicle.find({ user_Id: userId });
  console.log("userDetail", userDetail);
  res.json({ userDetail });
} catch (error) {
  console.error('Error fetching user:', error);
  res.status(500).json({ message: 'Internal Server Error', error });
}
});

app.get('/api/appointments/:id', async (req, res) => {
try {
  const userId = req.params.id;
  const serviceDetail = await serviceAppointment.find({ user_Id: userId });
  console.log("serviceDetail", serviceDetail);
  res.json({ serviceDetail });
} catch (error) {
  console.error('Error fetching user:', error);
  res.status(500).json({ message: 'Internal Server Error', error });
}
});


// async function sendReminderEmail(email, serviceDate) {
// let transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//       user: 'isakkiraj78@@gmail.com',  
//       pass: 'Esscooty@7300'  
//   }
// });

// let mailOptions = {
//   from: 'isakkiraj78@@gmail.com',  
//   to: email,
//   subject: 'Service Appointment Reminder',
//   text: `This is a reminder that you have a service appointment on ${serviceDate}.`
// };

// try {
//   await transporter.sendMail(mailOptions);
//   console.log('Reminder email sent to ' + email);
// } catch (error) {
//   console.error('Error sending email: ', error);
// }
// }

// async function checkAppointments() {
// try {
//   const today = new Date();
//   today.setDate(today.getDate() - 30);  // 30 days in the past
//   const targetDate = today.toISOString().split('T')[0];

//   const appointments = await serviceAppointment.find({
//       date: targetDate
//   }).populate('user_Id');  // Populate user_Id to get user details

//   for (const appointment of appointments) {
//       if (appointment.user_Id && appointment.user_Id.email) {
//           await sendReminderEmail(appointment.user_Id.email, appointment.date);
//       }
//   }
// } catch (error) {
//   console.error('Error checking appointments:', error);
// }
// }


// cron.schedule('0 0 * * *', () => {
// console.log('Running cron job...');
// checkAppointments().catch(console.error);
// });

async function sendReminderEmail(email, serviceDate) {
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'rajiaskki7@gmail.com',  // Corrected double '@'
          pass: 'Esscooty'
      }
  });

  let mailOptions = {
      from: 'isakkiraj78@gmail.com',  // Corrected double '@'
      to: email,
      subject: 'Service Appointment Reminder',
      text: `This is a reminder that you have a service appointment on ${serviceDate}.`
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Reminder email sent to ' + email);
  } catch (error) {
      console.error('Error sending email: ', error);
  }
}

async function sendReminderEmail(email, serviceDate) {
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'isakkiraj78@gmail.com',
          pass: 'Esscooty@7300'
      }
  });

  let mailOptions = {
      from: 'isakkiraj78@gmail.com',
      to: email,
      subject: 'Service Appointment Reminder',
      text: `This is a reminder that you have a service appointment on ${serviceDate}.`
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Reminder email sent to ' + email);
  } catch (error) {
      console.error('Error sending email: ', error);
  }
}

async function checkAppointments() {
  try {
      const today = new Date();
      today.setDate(today.getDate() - 30);  // 30 days in the past
      const targetDate = today.toISOString().split('T')[0];

      console.log('Checking appointments for date:', targetDate);

      const appointments = await serviceAppointment.find({
          date: targetDate
      }).populate('user_Id');

      console.log('Appointments found:', appointments);

      for (const appointment of appointments) {
          if (appointment.user_Id && appointment.user_Id.email) {
              console.log('Sending reminder email to:', appointment.user_Id.email);
              await sendReminderEmail(appointment.user_Id.email, appointment.date);
          }
      }
  } catch (error) {
      console.error('Error checking appointments:', error);
  }
}

cron.schedule('0 0 * * *', () => {
  console.log('Running cron job...');
  checkAppointments().catch(console.error);
});

async function sendTestEmailNow() {
  const testEmail = 'rajisakki7@gmail.com';
  const testDate = new Date().toISOString().split('T')[0];
  await sendReminderEmail(testEmail, testDate);
}

// Send test email immediately
sendTestEmailNow().then(() => {
  console.log('Test email sent successfully.');
}).catch((error) => {
  console.error('Error sending test email:', error);
});

const transporter = nodemailer.createTransport({
  host:'smtp.gmail.com', // Your SMTP server hostname
  port: 587, // Your SMTP server port (587 for TLS)
  secure: false, // false for TLS - as a boolean not string - if true the port is 465
  auth: {
    user: 'rajisakki7@gmail.com', // Your email address
    pass: 'Esscooty' // Your email password or app password if 2FA is enabled
  },
});

async function sendReminderEmail(toEmail, appointmentDate) {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: 'rajisakki7@gmail.com', // Sender address
      to: 'rajisakki7@gmail.com', // List of recipients
      subject: 'Appointment Reminder', // Subject line
      text: `This is a reminder for your appointment on ${appointmentDate}.`, // Plain text body
      html: `<p>This is a reminder for your appointment on ${appointmentDate}.</p>`, // HTML body
    });

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error to handle it elsewhere
  }
}
app.listen(port, "localhost", async() => {
console.log(`Server started on http://localhost:${port}`);
try {
  const testEmail = 'rajisakki7@gmail.com';
  const testDate = new Date().toISOString().split('T')[0];
  await sendReminderEmail(testEmail, testDate);
  console.log('Test email sent successfully.');
} catch (error) {
  console.error('Error sending test email:', error);
}
checkAppointments().catch(console.error);
});
