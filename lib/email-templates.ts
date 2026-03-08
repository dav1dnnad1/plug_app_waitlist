export const getConfirmationEmailHtml = (
  firstName: string,
  confirmLink: string,
  referralCode: string,
  userType: string
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PLUG</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      color: #1e293b;
      font-size: 24px;
      margin: 0 0 16px 0;
    }
    p {
      color: #64748b;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      background-color: #2563EB;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      font-weight: 600;
      margin: 24px 0;
      font-size: 16px;
    }
    .code-box {
      background-color: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .code {
      font-size: 32px;
      font-weight: 700;
      color: #2563EB;
      letter-spacing: 2px;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid #2563EB;
      padding: 16px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #94a3b8;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 32px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">plug.</div>
      <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">Welcome to the waitlist!</p>
    </div>
    
    <div class="content">
      <h1>Hi ${firstName}! 👋</h1>
      
      <p>You're officially on the PLUG waitlist as a <strong>${userType === 'provider' ? 'service provider' : 'service user'}</strong>! We're excited to have you.</p>
      
      <p>Click the button below to confirm your email and secure your spot:</p>
      
      <center>
        <a href="${confirmLink}" class="button">Confirm My Email</a>
      </center>
      
      <div class="divider"></div>
      
      <h1>📢 Start Referring, Start Earning</h1>
      
      <p>Share your unique referral code with friends and climb the leaderboard. The top referrer wins <strong>£1,500</strong> at launch!</p>
      
      <div class="code-box">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">Your Referral Code</p>
        <div class="code">${referralCode}</div>
      </div>
      
      <p>Share this link:</p>
      <p style="background-color: #f8fafc; padding: 12px; border-radius: 8px; font-family: 'Monaco', 'Courier New', monospace; font-size: 14px; word-break: break-all;">
        https://plugservices.ng?ref=${referralCode}
      </p>
      
      <div class="info-box">
        <p style="margin: 0; color: #1e40af;"><strong>🎁 Referral Rewards:</strong></p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #475569;">
          <li>3 referrals: Unlock booking credit</li>
          <li>5 referrals: Get premium badge</li>
          <li>10 referrals: VIP status with priority support</li>
          <li>Top referrer: Win £1,500!</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <h1>What's Next?</h1>
      
      <p>We're working hard to launch in <strong>February 2026</strong>. You'll be among the first to know when we go live.</p>
      
      <p>In the meantime:</p>
      <ul style="color: #64748b; line-height: 1.8;">
        <li>Share your referral code to unlock rewards</li>
        <li>Watch your inbox for updates</li>
        <li>Follow us on social media for sneak peeks</li>
      </ul>
      
      <p style="margin-top: 32px;">See you soon on PLUG!</p>
      <p style="color: #2563EB; font-weight: 600;">The PLUG Team</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 8px 0;">PLUG - Discover trusted local services</p>
      <p style="margin: 0; font-size: 12px;">
        You received this email because you signed up for the PLUG waitlist.<br>
        <a href="#" style="color: #2563EB;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export const getConfirmationEmailText = (
  firstName: string,
  confirmLink: string,
  referralCode: string
) => `
Hi ${firstName}!

You're officially on the PLUG waitlist! We're excited to have you.

Confirm your email: ${confirmLink}

YOUR REFERRAL CODE: ${referralCode}

Share this link to earn rewards:
https://plugservices.ng?ref=${referralCode}

Referral Rewards:
- 3 referrals: Unlock booking credit
- 5 referrals: Get premium badge
- 10 referrals: VIP status
- Top referrer: Win £1,500!

We're launching in February 2026. You'll be among the first to know!

See you soon on PLUG!
The PLUG Team

---
You received this email because you signed up for the PLUG waitlist.
Unsubscribe: https://plugservices.ng/unsubscribe
`;