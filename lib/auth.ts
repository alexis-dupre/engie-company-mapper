export function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);

  // Pour l'instant, vérification simple du token
  // Le token est créé lors du login
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.includes('admin@companymap.com');
  } catch {
    return false;
  }
}
