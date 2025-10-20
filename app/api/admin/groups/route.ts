/**
 * API Routes : Gestion des groupes
 * GET /api/admin/groups - Liste tous les groupes
 * POST /api/admin/groups - Crée un nouveau groupe
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAllGroupsMetadata,
  createGroup,
  initStorage,
  validateGroupData,
} from '@/lib/storage';
import { CompanyData } from '@/types/company';
import { GroupTag, DiliTrustModule } from '@/types/group';

// Middleware d'authentification simplifié
function checkAuth(): boolean {
  const token = cookies().get('admin_session')?.value;
  return !!token; // Simple check: token exists
}

/**
 * GET - Récupérer tous les groupes
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    if (!checkAuth()) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Initialiser le storage si nécessaire
    await initStorage();

    // Récupérer tous les groupes (admin = voir tous, même non publics)
    const groups = await getAllGroupsMetadata(false);

    return NextResponse.json({
      success: true,
      data: groups,
      total: groups.length,
    });
  } catch (error) {
    console.error('Error getting groups:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un nouveau groupe
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    if (!checkAuth()) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      tags,
      dilitrustModules,
      comments,
      isPublic,
      jsonData,
    } = body;

    // Validation des champs requis
    if (!name || !jsonData) {
      return NextResponse.json(
        { success: false, error: 'Nom et données JSON requis' },
        { status: 400 }
      );
    }

    // Validation du JSON
    const validation = validateGroupData(jsonData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Validation des modules DiliTrust si le tag est présent
    if (tags && tags.includes('CLIENT_DILITRUST')) {
      if (!dilitrustModules || dilitrustModules.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Modules DiliTrust requis pour les clients DiliTrust' },
          { status: 400 }
        );
      }
    }

    // Initialiser le storage
    await initStorage();

    // Créer le groupe
    const groupMetadata = await createGroup(name, jsonData as CompanyData, {
      description: description || '',
      tags: (tags || []) as GroupTag[],
      dilitrustModules: (dilitrustModules || []) as DiliTrustModule[],
      comments: comments || '',
      isPublic: isPublic ?? true,
    });

    return NextResponse.json({
      success: true,
      data: groupMetadata,
      message: 'Groupe créé avec succès',
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
