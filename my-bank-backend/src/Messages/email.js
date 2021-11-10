const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendEmail = (email, name, url) => {
  sgMail.send({
    to: email,
    from: "Chaabane504@gmail.com",
    subject: "Password Verification",
    html:
      "<div><p>To: <strong>" +
      name +
      "</string> </p> Here's a link to start a new password  <a href=" +
      url +
      ">new password</a></div>"
  });
};

module.exports = { sendEmail };
