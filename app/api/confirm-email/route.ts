import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// In-memory rate limiting (simple approach)
// For production, use Redis (Upstash)
const confirmAttempts = new Map<string, number[]>();
const MAX_ATTEMPTS = 5; // 5 attempts per hour per IP
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = confirmAttempts.get(ip) || [];
  
  // Remove attempts older than 1 hour
  const recentAttempts = attempts.filter(time => now - time < WINDOW_MS);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false; // Rate limited
  }
  
  recentAttempts.push(now);
  confirmAttempts.set(ip, recentAttempts);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'too many confirmation attempts please try again later' },
        { status: 429 }
      );
    }

    const { code } = await request.json();

    // Validate code exists and is correct format
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'invalid confirmation code' },
        { status: 400 }
      );
    }

    // Validate code format (8 uppercase alphanumeric characters)
    if (!/^[A-Z0-9]{8}$/.test(code)) {
      return NextResponse.json(
        { error: 'invalid confirmation code format' },
        { status: 400 }
      );
    }

    // Find user by referral code
    const { data: user, error: fetchError } = await supabase
      .from('waitlist')
      .select('id, email, email_confirmed, created_at')
      .eq('referral_code', code)
      .single();

    if (fetchError || !user) {
      // Don't reveal whether code exists (security best practice)
      return NextResponse.json(
        { error: 'invalid or expired confirmation code' },
        { status: 400 }
      );
    }

    const alreadyConfirmed = user.email_confirmed;

    // Update confirmation status if not already confirmed
    if (!alreadyConfirmed) {
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({
          email_confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('referral_code', code);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'failed to confirm email' },
          { status: 500 }
        );
      }
    }

    // Get user position on waitlist
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', user.created_at);

    return NextResponse.json({
      success: true,
      position: count || 0,
      alreadyConfirmed
    });

  } catch (error: any) {
    console.error('Confirm email error:', error);
    return NextResponse.json(
      { error: 'internal server error' },
      { status: 500 }
    );
  }
}