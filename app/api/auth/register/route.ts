import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, businessName, category, instagram } = body;

    let authUser: { id: string; email?: string } | null = null;
    let authErrorMessage: string | null = null;

    if (supabase && email) {
      try {
        const uniqueEmail = email.includes('+')
          ? email
          : `${email.split('@')[0]}+${Date.now()}@${email.split('@')[1] || 'nextvisit.app'}`;

        const res = await supabase.auth.signUp({
          email: uniqueEmail,
          password: password || 'DefaultPass123!',
          options: {
            data: {
              business_name: businessName,
              category,
              instagram_handle: instagram,
            },
          },
        });
        authUser = res.data?.user ? { id: res.data.user.id, email: res.data.user.email } : null;
        authErrorMessage = res.error?.message || null;
      } catch (err: unknown) {
        authErrorMessage = err instanceof Error ? err.message : 'Auth error';
      }
    }

    return NextResponse.json({
      success: true,
      registered: !authErrorMessage,
      user: authUser,
      message: authErrorMessage || 'Merchant registered successfully',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 200 }
    );
  }
}
