// const htmlToText = require('html-to-text');
const { convert } = require('html-to-text');
const pug = require('pug');
const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Vilhelms Balodis <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // render html page
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html),
      text: convert(html, { wordwrap: false }),
    };
    // create transport and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token is valid for 10 min');
  }
};
