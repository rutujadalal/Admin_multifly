const generateOTPTemplate = (otp) => {
  return `
    <div style="max-width: 500px; margin: auto; font-family: Arial, sans-serif; text-align: center; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #0056b3; padding: 15px; border-radius: 10px 10px 0 0;">
            <h2 style="color: #ffffff; margin: 0;">MultiFly Travel</h2>
        </div>
        <div style="padding: 20px;">
            <h3 style="color: #333;">Here is your One Time OTP</h3>
            <p style="color: #555;">To validate your email address, use the OTP below:</p>
            <h1 style="color: #0056b3; font-size: 32px; margin: 20px 0;">${otp}</h1>
            <p style="color: #d9534f; font-weight: bold;">Valid for 5 minutes only</p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 14px; color: #666;">Follow us on:</p>
            <div>
                <a href="https://www.facebook.com" target="_blank" style="margin: 0 10px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="30" alt="Facebook">
                </a>
                <a href="https://www.instagram.com" target="_blank" style="margin: 0 10px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="30" alt="Instagram">
                </a>
                <a href="https://twitter.com" target="_blank" style="margin: 0 10px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="30" alt="Twitter">
                </a>
                <a href="https://www.linkedin.com" target="_blank" style="margin: 0 10px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="30" alt="LinkedIn">
                </a>
            </div>
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">For any issues, contact us at support@multiflytravel.com</p>
        </div>
    </div>
    `;
};

module.exports = generateOTPTemplate;
