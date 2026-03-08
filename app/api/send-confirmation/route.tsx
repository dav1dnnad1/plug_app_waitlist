import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.EMAIL_API_KEY);

// Service role key — server only, never expose client-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, referralCode, userType, services } = await request.json();

    if (!email || !firstName || !referralCode) {
      return NextResponse.json({ error: 'missing required fields' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const referralLink = `${appUrl}?ref=${referralCode}`;

    const { data, error } = await resend.emails.send({
      from: 'plug. <hello@plugservices.ng>',
      to: [email],
      subject: `you're on the plug waitlist 🔌`,
      html: buildEmailHtml({ firstName, referralCode, referralLink, userType, services }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log to email_logs
    await supabaseAdmin.from('email_logs').insert([{
      email:         email.toLowerCase(),
      first_name:    firstName,
      last_name:     lastName || null,
      referral_code: referralCode,
      email_type:    'confirmation',
      resend_id:     data?.id || null,
      sent_at:       new Date().toISOString(),
    }]);

    // Mark confirmation_sent on waitlist row
    await supabaseAdmin
      .from('waitlist')
      .update({
        confirmation_sent:    true,
        confirmation_sent_at: new Date().toISOString(),
      })
      .eq('referral_code', referralCode);

    return NextResponse.json({ success: true, messageId: data?.id });

  } catch (error: any) {
    console.error('send-confirmation error:', error);
    return NextResponse.json({ error: error.message || 'internal server error' }, { status: 500 });
  }
}

function buildEmailHtml({
  firstName, referralCode, referralLink, userType, services,
}: {
  firstName: string; referralCode: string; referralLink: string;
  userType?: string; services?: string[];
}) {
  const servicesList = services?.length
    ? `<ul style="margin:6px 0 0;padding-left:18px;">${services.map(s =>
        `<li style="margin:3px 0;font-size:13px;color:#4B5563;text-transform:lowercase;">${s}</li>`
      ).join('')}</ul>` : '';

  const tiers = [
    { k: 'join',         label: 'early access',   note: "you're already in ✓" },
    { k: '3 referrals',  label: 'booking credit', note: 'exclusive credit'      },
    { k: '5 referrals',  label: 'premium badge',  note: 'verified member status'},
    { k: '10 referrals', label: 'vip status',     note: 'priority support'      },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f7f9fc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <tr>
          <td style="padding:28px 36px 24px;border-bottom:1px solid #f0f0f0;">
            <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:-0.03em;color:#0b0b0b;line-height:1;">pl<span style="color:#007bff;">u</span>g<span style="color:#007bff;">.</span></p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0b0b0b;letter-spacing:-0.02em;">you're on the list, ${firstName} 🔌</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.65;">welcome to plug — discover trusted local professionals in lagos. you're one of the first.</p>
            ${userType ? `<p style="margin:0 0 20px;font-size:13px;color:#6B7280;">joined as: <strong style="color:#0b0b0b;text-transform:lowercase;">${userType}</strong></p>` : ''}
            ${servicesList ? `<div style="background:#f7f9fc;border-radius:10px;padding:16px 18px;margin-bottom:24px;border:1px solid #e2e8f0;"><p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;">selected services</p>${servicesList}</div>` : ''}
            <div style="background:#fff8e6;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #fde68a;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#d97706;text-transform:uppercase;letter-spacing:0.06em;">🏆 referral competition</p>
              <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#0b0b0b;letter-spacing:-0.02em;">win £1,500 cash</p>
              <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.55;">the person with the most referrals at launch wins £1,500 paid directly to them. share your link below to enter.</p>
            </div>
            <div style="background:#f0f7ff;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid rgba(0,123,255,0.18);">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#007bff;text-transform:uppercase;letter-spacing:0.06em;">your referral link</p>
              <p style="margin:0 0 18px;font-size:13px;color:#4B5563;line-height:1.55;">share this with friends — every referral unlocks perks and enters you to win £1,500.</p>
              <a href="${referralLink}" style="display:inline-block;background:#007bff;color:#fff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:9999px;text-decoration:none;">share your link →</a>
              <p style="margin:14px 0 0;font-size:11px;color:#9CA3AF;word-break:break-all;">${referralLink}</p>
            </div>
            <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;">unlock with referrals</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${tiers.map(t => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:13px;color:#0b0b0b;font-weight:500;text-transform:lowercase;">${t.label}</td><td align="right"><span style="font-size:11px;color:#9CA3AF;">${t.k}</span><span style="font-size:11px;color:#6B7280;"> · ${t.note}</span></td></tr></table></td></tr>`).join('')}
            </table>
            <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.6;">questions? reply to this email.<br/>— the plug team</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 36px;border-top:1px solid #f0f0f0;background:#fafafa;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.7;">you're receiving this because you joined the plug waitlist.<br/>referral code: <strong style="color:#0b0b0b;">${referralCode}</strong></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}