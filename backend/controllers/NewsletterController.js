const connection = require("../database/db");
const sendEmail = require("../utils/sendEmail");
const { isValidEmail } = require("../utils/validation");

// Add email to newsletter list
const submitEmail = async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Use the validation function
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Add length validation
  if (email.length > 100) {
    return res.status(400).json({ error: "Email is too long" });
  }

  const sql = `
        INSERT INTO Email_Newsletter (email)
        VALUES (?)
    `;

  connection.query(sql, [email], async (err) => {
    if (err) {
      // Handle duplicate email
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Email already registered" });
      }
      return res.status(500).json({ error: err.message });
    }

    try {
      console.log("Email inviata a:", email);
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h2>Dear Customer,</h2>
            
            <p>✨ <strong>Thank you for subscribing to the Boolean Shop newsletter!</strong> ✨</p>
            
            <p>Here's what you'll receive:</p>
            <ul>
                <li>Exclusive offers</li>
                <li>Product updates</li>
                <li>Special discounts</li>
                <li>Personalized content</li>
            </ul>
            
            <p>Best regards,<br>
            The Boolean Shop Team</p>
            
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #777;">
                If you wish to unsubscribe from our newsletter, <a href="http://localhost:5173/unsubscribe-newsletter">click here</a>.<br>
                © ${new Date().getFullYear()} Boolean Shop. All rights reserved.
            </p>
        </div>
      `;
      await sendEmail(email, "Welcome to Boolean Shop Newsletter", htmlContent);

      res.status(201).json({
        message: "Email registrata con successo!",
        success: true,
      });
    } catch (error) {
      console.error("Errore invio email:", error);
      res.status(201).json({
        message: "Email registrata ma invio conferma fallito",
        success: true,
      });
    }
  });
};

// Get all newsletter subscribers (admin use only)
function getAllSubscribers(req, res) {
  const sql = `
        SELECT * 
        FROM Email_Newsletter
        ORDER BY created_at DESC
    `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
}

// Delete email from newsletter list (unsubscribe)
function unsubscribeEmail(req, res) {
  const { email } = req.params;
  const sql = `
        DELETE FROM Email_Newsletter
        WHERE email = ?
    `;

  connection.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Email not found in subscription list" });
    }

    res.json({ message: "Successfully unsubscribed" });
  });
}

module.exports = {
  submitEmail,
  getAllSubscribers,
  unsubscribeEmail,
};
