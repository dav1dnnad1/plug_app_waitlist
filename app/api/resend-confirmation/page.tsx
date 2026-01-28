import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { getConfirmationEmailHtml, getConfirmationEmailText } from '@/lib/email-templates';

const resend = new Resend(process.env.EMAIL_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Fetch user from database
    const { data: user, error: dbError } = await supabase
      .from('waitlist')
      .select('first_name, last_name, referral_code, user_type, confirmed')
      .eq('email', email.toLowerCase())
      .single();

    if (dbError || !user) {
      return NextResponse.json(
        { error: 'Email not found in waitlist' },
        { status: 404 }
      );
    }

    if (user.confirmed) {
      return NextResponse.json(
        { error: 'Email already confirmed' },
        { status: 400 }
      );
    }

    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/confirm?code=${user.referral_code}`;

    const { data, error } = await resend.emails.send({
      from: 'PLUG <hello@plugservices.ng>',
      to: [email],
      subject: `Confirm your PLUG waitlist spot, ${user.first_name}`,
      html: getConfirmationEmailHtml(user.first_name, confirmLink, user.referral_code, user.user_type),
      text: getConfirmationEmailText(user.first_name, confirmLink, user.referral_code),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}