const nodemailer = require("nodemailer");
/* require("dotenv").config(); */

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

async function sendEmail(to, subject, htmlContent) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email inviata:", info.response);
        return info;
    } catch (error) {
        console.error("Errore invio email:", error);
        throw error;
    }
}

module.exports = sendEmail;
