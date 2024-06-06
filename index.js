const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const app = express();
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const url = 'mongodb+srv://isakkiraj:Esscooty%407300@cluster0.fdsuknk.mongodb.net/vehiclecare';
const usermodel = require('./model/user');
const serviceAppointment = require('./model/appointment');
const vehicle = require('./model/vehicle');

require("dotenv").config()
console.log(process.env)
const port = process.env.PORT;
const hostname=process.env.HOSTNAME
mongoose.connect(url)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    usermodel.findOne({ email })
        .then(user => {
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
        .catch(error => {
            console.error('Error during login:', error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        });
});

app.post('/api/register', (req, res) => {
    usermodel.create(req.body)
        .then(user => res.json(user))
        .catch(err => res.json(err));
});

app.post('/api/vehicle', (req, res) => {
    vehicle.create(req.body)
        .then(vehicle => res.json(vehicle))
        .catch(err => res.json(err));
});

app.post('/api/appointment', (req, res) => {
    serviceAppointment.create(req.body)
        .then(appointment => {
            console.log(req.body);
            res.json(appointment);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
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
    const { id: userId } = req.params;
    console.log("id", userId);
    try {
        const userDetail = await vehicle.find({ user_Id: userId });
        console.log("userDetail", userDetail);
        res.json({ userDetail });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

app.get('/api/appointments/:id', async (req, res) => {
    const { id: userId } = req.params;
    try {
        const serviceDetail = await serviceAppointment.find({ user_Id: userId });
        console.log("serviceDetail", serviceDetail);
        res.json({ serviceDetail });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});


app.get('/api/appointments/expenses/:id', async (req, res) => {
    const { id: userId } = req.params;
    try {
        const appointments = await serviceAppointment.find({ user_Id: userId });
        const expenses = {};
        appointments.forEach(appointment => {
            const vehicleNumber = appointment.vehicle;
            const date = new Date(appointment.date); 
            const month = date.toISOString().substring(0, 7); 
  
            if (!expenses[vehicleNumber]) {
                expenses[vehicleNumber] = { monthly: {}, total: 0 };
            }
            expenses[vehicleNumber].monthly[month] = (expenses[vehicleNumber].monthly[month] || 0) + appointment.total;
            expenses[vehicleNumber].total += appointment.total;
        });
  
        console.log("Expenses:", expenses);
        res.json({ expenses });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
  });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vehiclecare77@gmail.com', // Your email address
        pass: 'sgmw mjku fzks orwu'  // Your email password
    }
});

async function sendReminderEmail(email, serviceDate) {
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Service Appointment Reminder',
        text: `This is a reminder that you have previously received service on ${serviceDate}, which was one month ago.`
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
        let today = new Date(); // Get current date
        let thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // Subtract 30 days (in milliseconds)
        console.log("30 days before",thirtyDaysAgo)
        const targetDate = today.toISOString().split('T')[0];

        console.log('Checking appointments for date:', targetDate);

        const appointments = await serviceAppointment.find({
            date: targetDate
        }).populate('user_Id');

        console.log('Appointments found:', appointments);

        for (const appointment of appointments) {
            if (appointment.user_Id && appointment.user_Id.email) {
                console.log('Sending reminder email to:', appointment.user_Id.email);
                await sendReminderEmail(appointment.user_Id.email, targetDate);
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
    //await sendReminderEmail(testEmail, testDate);
}

// let transporter = nodemailer.createTransport({
//     service: 'gmail', // Use your email service, e.g., 'gmail'
//     auth: {
//         user: 'vehiclecare77@gmail.com', // Your email address
//         pass: 'sgmw mjku fzks orwu'  // Your email password
//     }
// });


// let mailOptions = {
//     from: '"Your Name" vehiclecare77@gmail.com', // Sender address
//     to: 'rajisakki7@gmail.com', // List of receivers
//     subject: 'Email Testing', // Subject line
//     text: 'Email send', // Plain text body
//     html: '<b>Email Testing</b>' // HTML body
// };

// Send mail with defined transport object

app.get("/",(req,res) => {
    res.send("hello")
})


// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await usermodel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User with this email does not exist.' });
      }
  
     
      const otp = crypto.randomBytes(3).toString('hex');
      user.resetPasswordOTP = otp;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'vehiclecare77@gmail.com',
          pass: 'sgmw mjku fzks orwu',
        },
      });
  
      const mailOptions = {
        from: 'vehiclecare77@gmail.com',
        to: user.email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. This OTP is valid for one hour.`,
      };
  
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  
  app.post('/api/reset', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    
    try {
      
      const user = await usermodel.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      
      if (!user) {
        return res.status(400).json({ message: 'OTP is invalid or has expired.' });
      }
  
      
      user.password = newPassword; 
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(200).json({ message: 'Password has been updated successfully.' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
});

app.post('/api/create-order', async (req, res) => {
    const { amount, currency, receipt } = req.body;

    const instance = new Razorpay({
        key_id: 'rzp_test_1uFgghWu3HRlkf',
        key_secret: '8RLGB9f5E7dPrw0T8LuARgub',
    });

    const options = {
        amount: amount * 100,  // Amount in paise
        currency,
        receipt,
    };

    try {
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
});



app.listen(port, {hostname}, async () => {
    console.log(`Server started on http://localhost:${port}`);
   //checkAppointments()
    // checkAppointments().catch(console.error);
});
