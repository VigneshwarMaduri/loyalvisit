import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, businessName, category, instagram } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    let authUser: { id: string; email?: string } | null = null;
    let authErrorMessage: string | null = null;

    if (supabase) {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            business_name: businessName,
            category,
            instagram_handle: instagram,
          },
        },
      });

      if (res.error) {
        authErrorMessage = res.error.message;
      } else {
        authUser = res.data?.user ? { id: res.data.user.id, email: res.data.user.email } : null;
      }
    }

    if (authErrorMessage) {
      return NextResponse.json(
        { success: false, error: authErrorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authUser,
      message: 'Merchant registered successfully',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
