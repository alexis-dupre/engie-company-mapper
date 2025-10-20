/**
 * API Route : Authentification admin - Version simplifiée sans crypto
 * POST /api/admin/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Credentials hardcodés pour simplifier
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@companymap.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation des champs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérification simple des credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Token de session simple (juste l'email encodé en base64)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    // Stockage du token dans un cookie HTTP-only
    cookies().set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
