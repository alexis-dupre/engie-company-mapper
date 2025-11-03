#!/bin/bash

# Script pour supprimer un groupe Saur via l'API

echo "🔍 Connexion à l'API admin..."

# Configuration
API_URL="http://localhost:3000"
EMAIL="admin@companymap.com"
PASSWORD="admin123"

# Connexion et récupération du token
echo "📝 Authentification..."
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erreur d'authentification"
  echo "Réponse: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Authentification réussie"

# Récupération de la liste des groupes
echo ""
echo "📋 Récupération de la liste des groupes..."
GROUPS_RESPONSE=$(curl -s "$API_URL/api/admin/groups")

echo "$GROUPS_RESPONSE" | grep -o '"name":"Saur"' > /dev/null
if [ $? -ne 0 ]; then
  echo "❌ Aucun groupe Saur trouvé"
  exit 1
fi

# Afficher les groupes (pour information)
echo ""
echo "Groupes trouvés:"
echo "$GROUPS_RESPONSE" | jq -r '.groups[] | select(.name=="Saur") | "  - ID: \(.id) | Nom: \(.name) | Créé: \(.createdAt)"' 2>/dev/null || echo "$GROUPS_RESPONSE"

# Récupérer le premier ID Saur
SAUR_ID=$(echo "$GROUPS_RESPONSE" | jq -r '.groups[] | select(.name=="Saur") | .id' 2>/dev/null | head -1)

if [ -z "$SAUR_ID" ]; then
  echo "❌ Impossible de récupérer l'ID du groupe Saur"
  exit 1
fi

echo ""
echo "🗑️  Suppression du groupe Saur (ID: $SAUR_ID)..."

# Suppression
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/admin/groups/$SAUR_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DELETE_RESPONSE" | grep -o '"success":true' > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Groupe Saur supprimé avec succès!"
else
  echo "❌ Erreur lors de la suppression"
  echo "Réponse: $DELETE_RESPONSE"
  exit 1
fi

echo ""
echo "✨ Terminé! Rechargez la page admin pour voir les changements."
