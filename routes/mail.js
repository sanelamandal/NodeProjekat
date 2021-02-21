var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'restoran.sanela@gmail.com',
    pass: 'RestoranSanela123'
  }
});

var mailOptions = {
  from: 'restoran.sanela@gmail.com',
  to: 'sanela.mandal@gmail.com',
  subject: 'Order confirmation',
  text: 'Thank you for your purchase. You will receive your delivery shortly!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});