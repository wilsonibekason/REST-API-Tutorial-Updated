import nodemailer from "nodemailer";

// Reusable function to send emails
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "viva60@ethereal.email",
      pass: "9BEvK2fg9ATrBhrmp2",
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Support Team" <wanbekgithub@gmail.com>', // sender address
    to, // receiver's email
    subject, // Subject line
    text, // plain text body
    html, // html body
  });

  console.log("Message sent: %s", info.messageId);
}
