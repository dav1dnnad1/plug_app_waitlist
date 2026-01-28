import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.EMAIL_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, referralCode, userType } = await request.json();

    if (!email || !firstName || !referralCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const referralLink = `${appUrl}?ref=${referralCode}`;

    const { data, error } = await resend.emails.send({
      from: 'PLUG <onboarding@resend.dev>', // ← NO DOMAIN NEEDED!
      to: [email],
      subject: `Welcome to PLUG, ${firstName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 30px 0;
            }
            .logo {
              font-size: 32px;
              font-weight: 700;
              color: #0b0b0b;
            }
            .logo span {
              color: #007bff;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 12px;
              margin: 20px 0;
            }
            .referral-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 2px solid #007bff;
            }
            .referral-link {
              background: #e3f2fd;
              padding: 12px;
              border-radius: 6px;
              word-break: break-all;
              font-family: 'Courier New', monospace;
              font-size: 14px;
              margin: 10px 0;
            }
            .btn {
              display: inline-block;
              background: #007bff;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              color: #6c757d;
              font-size: 12px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">plug<span>.</span></div>
          </div>
          
          <div class="content">
            <h2 style="color: #007bff; margin-top: 0;">Welcome, ${firstName}!</h2>
            
            <p>You're officially on the PLUG waitlist as a <strong>${userType}</strong>. We're building something special for Lagos, and you'll be among the first to experience it when we launch in <strong>February 2026</strong>.</p>
            
            <div class="referral-box">
              <h3 style="margin-top: 0; color: #007bff;">🎉 Earn £1,500!</h3>
              <p>Share your unique referral link to climb the leaderboard. The top referrer wins <strong>£1,500</strong> at launch!</p>
              
              <div class="referral-link">${referralLink}</div>
              
              <p style="font-size: 14px; color: #6c757d; margin-bottom: 0;">
                Rewards:
                • 3 referrals = Booking credit<br>
                • 5 referrals = Premium badge<br>
                • 10 referrals = VIP status
              </p>
            </div>
            
            <p>We'll keep you updated on our progress. Get ready for the easiest way to discover trusted service providers in Lagos!</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PLUG. All rights reserved.</p>
            <p>You're receiving this because you joined our waitlist.</p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}