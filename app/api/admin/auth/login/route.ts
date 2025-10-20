import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@companymap.com';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json({
      success: false,
      message: 'Identifiants incorrects'
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erreur serveur'
    }, { status: 500 });
  }
}
