/**
 * Utilitaires d'authentification pour l'interface admin
 * Version simple avec hash de mot de passe
 */

import crypto from 'crypto';

// Configuration - À déplacer dans .env en production
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@companymap.com',
  // Mot de passe haché (par défaut: "admin123" - À CHANGER EN PRODUCTION)
  passwordHash: process.env.ADMIN_PASSWORD_HASH || hashPassword('admin123'),
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

/**
 * Hash un mot de passe avec SHA-256
 */
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * Vérifie les credentials
 */
export function verifyCredentials(email: string, password: string): boolean {
  const hashedPassword = hashPassword(password);

  return (
    email === ADMIN_CREDENTIALS.email &&
    hashedPassword === ADMIN_CREDENTIALS.passwordHash
  );
}

/**
 * Génère un token de session simple
 */
export function generateSessionToken(email: string): string {
  const payload = {
    email,
    expiresAt: Date.now() + SESSION_DURATION,
  };

  const data = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('hex');

  return Buffer.from(JSON.stringify({ data, signature })).toString('base64');
}

/**
 * Vérifie et décode un token de session
 */
export function verifySessionToken(token: string): { email: string; expiresAt: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { data, signature } = decoded;

    // Vérifier la signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(data);

    // Vérifier l'expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Middleware pour vérifier l'authentification
 */
export function isAuthenticated(token?: string): boolean {
  if (!token) {
    return false;
  }

  const session = verifySessionToken(token);
  return session !== null;
}

/**
 * Récupère l'utilisateur depuis le token
 */
export function getUserFromToken(token: string): { email: string } | null {
  const session = verifySessionToken(token);

  if (!session) {
    return null;
  }

  return { email: session.email };
}
