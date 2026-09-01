import nodemailer from 'nodemailer';

console.log('=== SMTP CONFIG ===');
console.log('HOST: smtp.gmail.com');
console.log('PORT: 465');
console.log('USER:', process.env.SMTP_USER);
console.log('PASS:', process.env.SMTP_PASS ? 'LOADED' : 'MISSING');
console.log('===================');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendNewPasswordEmail = async (
  email,
  name,
  newPassword
) => {
  const userName = name || 'User';

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Your Password Has Been Reset | Phantasm 2026',

    text: `PHANTASM 2026

Hello ${userName},

Your password has been reset successfully.

Your new password is:

${newPassword}

Please use this password to log in to your Phantasm 2026 account.

For security, we recommend changing your password after logging in.

This is an automated message from Phantasm 2026. Please do not reply to this email.`,

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f3f4f6;
  font-family: Arial, Helvetica, sans-serif;
  color: #1e293b;
">

  <div style="
    width: 100%;
    padding: 40px 15px;
    box-sizing: border-box;
  ">

    <div style="
      max-width: 690px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 22px;
      overflow: hidden;
    ">

      <!-- MAIN CONTENT -->
      <div style="
        padding: 38px 40px 30px;
      ">

        <!-- BRAND -->
        <div style="
          color: #0f5f96;
          font-size: 13px;
          font-weight: bold;
          letter-spacing: 7px;
          margin-bottom: 16px;
        ">
          PHANTASM 2026
        </div>

        <!-- TITLE -->
        <h1 style="
          margin: 0 0 25px;
          font-size: 26px;
          line-height: 1.4;
          color: #1e293b;
          font-weight: 700;
        ">
          Your password has been reset 🔐
        </h1>

        <!-- GREETING -->
        <p style="
          margin: 0 0 20px;
          font-size: 16px;
          line-height: 1.7;
          color: #1e293b;
        ">
          Hi ${userName},
        </p>

        <!-- MESSAGE -->
        <p style="
          margin: 0 0 28px;
          font-size: 16px;
          line-height: 1.7;
          color: #1e293b;
        ">
          Your password has been reset successfully. Use the new password below to log in to your Phantasm 2026 account.
        </p>

        <!-- PASSWORD BOX -->
        <div style="
          border: 1px dashed #1683c5;
          background-color: #f8fbfd;
          border-radius: 16px;
          padding: 20px 22px;
          margin: 10px 0 28px;
        ">

          <div style="
            color: #176da3;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 3px;
            margin-bottom: 12px;
          ">
            YOUR NEW PASSWORD
          </div>

          <div style="
            color: #1e293b;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 1px;
            word-break: break-word;
          ">
            ${newPassword}
          </div>

        </div>

        <!-- SECURITY MESSAGE -->
        <p style="
          margin: 0 0 12px;
          font-size: 16px;
          line-height: 1.7;
          color: #1e293b;
        ">
          Please use this password to log in.
        </p>

        <p style="
          margin: 0;
          font-size: 16px;
          line-height: 1.7;
          color: #1e293b;
        ">
          For security, we recommend changing your password after logging in.
        </p>

      </div>

      <!-- FOOTER -->
      <div style="
        border-top: 1px solid #e2e8f0;
        padding: 24px 40px;
        color: #64748b;
        font-size: 14px;
        line-height: 1.6;
      ">
        This is an automated message from Phantasm 2026. Please do not reply to this email.
      </div>

    </div>

  </div>

</body>
</html>
    `,
  });
};