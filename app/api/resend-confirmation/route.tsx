import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.EMAIL_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // ── Rate limit: max 3 resends per email ─────────────────────────────
    const { count } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .eq('email_type', 'confirmation');

    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'max resends reached — check your spam folder' }, { status: 429 });
    }

    // ── Fetch waitlist row ───────────────────────────────────────────────
    const { data: user, error: dbError } = await supabase
      .from('waitlist')
      .select('first_name, last_name, referral_code, user_type, email_confirmed')
      .eq('email', email.toLowerCase())
      .single();

    if (dbError || !user) {
      return NextResponse.json({ error: 'email not found on waitlist' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const referralLink = `${appUrl}?ref=${user.referral_code}`;

    // ── Send via Resend ──────────────────────────────────────────────────
    const { data, error } = await resend.emails.send({
      from: 'plug. <hello@plugservices.ng>',
      to: [email],
      subject: `your plug waitlist confirmation (resent)`,
      html: buildResendHtml({
        firstName:    user.first_name,
        referralCode: user.referral_code,
        referralLink,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'failed to send email' }, { status: 500 });
    }

    // ── Log the resend ───────────────────────────────────────────────────
    await supabase.from('email_logs').insert([{
      email:         email.toLowerCase(),
      first_name:    user.first_name,
      last_name:     user.last_name || null,
      referral_code: user.referral_code,
      email_type:    'confirmation',
      resend_id:     data?.id || null,
      sent_at:       new Date().toISOString(),
    }]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('resend-confirmation error:', error);
    return NextResponse.json({ error: error.message || 'internal server error' }, { status: 500 });
  }
}

function buildResendHtml({
  firstName,
  referralCode,
  referralLink,
}: {
  firstName: string;
  referralCode: string;
  referralLink: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f7f9fc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fc;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <tr>
          <td style="padding:28px 36px 24px;border-bottom:1px solid #f0f0f0;">
            <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:-0.03em;color:#0b0b0b;line-height:1;">
              pl<span style="color:#007bff;">u</span>g<span style="color:#007bff;">.</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0b0b0b;letter-spacing:-0.02em;">
              here's your confirmation, ${firstName}
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.65;">
              you're still on the plug waitlist. your referral link is below.
            </p>
            <div style="background:#f0f7ff;border-radius:12px;padding:24px;border:1px solid rgba(0,123,255,0.18);">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#007bff;text-transform:uppercase;letter-spacing:0.06em;">your referral link</p>
              <p style="margin:0 0 16px;font-size:13px;color:#4B5563;">share this to earn perks before launch.</p>
              <a href="${referralLink}" style="display:inline-block;background:#007bff;color:#fff;font-size:14px;font-weight:600;padding:12px 26px;border-radius:9999px;text-decoration:none;">
                share your link →
              </a>
              <p style="margin:14px 0 0;font-size:11px;color:#9CA3AF;word-break:break-all;">${referralLink}</p>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;">
              referral code: <strong style="color:#0b0b0b;">${referralCode}</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 36px;border-top:1px solid #f0f0f0;background:#fafafa;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;text-align:center;">
              you're receiving this because you're on the plug waitlist.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}