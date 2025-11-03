# Comment supprimer un groupe Saur

## ⚠️ Important : Le bouton de suppression est présent dans le code

Le bouton de suppression a été ajouté dans le fichier `app/admin/dashboard/page.tsx` (lignes 112-133) et est disponible sur GitHub dans la branche `claude/fix-admin-login-display-011CUmaAJbPPQP3r7YB97ezq`.

**Commits :**
- `26c571a` - Amélioration de la visibilité du bouton de suppression
- `6bcb72a` - Ajout de la suppression de groupes pour les administrateurs

## 🔄 Pour voir le bouton de suppression

### Méthode 1 : Redémarrer l'application

1. **Arrêtez votre serveur** : `Ctrl+C` dans le terminal
2. **Supprimez le cache Next.js** : `rm -rf .next`
3. **Redémarrez** : `npm run dev`
4. **Videz le cache du navigateur** : `Ctrl+Shift+Delete` ou `Cmd+Shift+R`
5. **Allez sur** : `http://localhost:3000/admin/dashboard`

Vous devriez voir une **icône de corbeille 🗑️** en haut à droite de chaque carte de groupe.

### Méthode 2 : Redéployer sur production (si déployé)

```bash
npm run build
npm start
```

## 🗑️ Pour supprimer un groupe Saur manuellement (via API)

Si le bouton n'apparaît toujours pas, utilisez cette commande cURL :

### 1. D'abord, récupérez l'ID du groupe Saur à supprimer :

```bash
curl http://localhost:3000/api/admin/groups
```

Cherchez les groupes avec le nom "Saur" et notez leur ID.

### 2. Ensuite, supprimez un groupe avec son ID :

Vous devez d'abord vous connecter pour obtenir un token admin :

```bash
# Connexion admin
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@companymap.com","password":"admin123"}'
```

Copiez le token retourné, puis :

```bash
# Suppression (remplacez TOKEN et GROUP_ID)
curl -X DELETE http://localhost:3000/api/admin/groups/GROUP_ID \
  -H "Authorization: Bearer TOKEN"
```

## 📁 Structure du bouton dans le code

Le bouton de suppression se trouve dans `/app/admin/dashboard/page.tsx` :

```tsx
<button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDeleteGroup(group.id, group.name);
  }}
  disabled={deletingId === group.id}
  className="absolute top-3 right-3 z-10 p-2 bg-card border border-border text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-300 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
  title="Supprimer ce groupe"
>
  {/* Icône corbeille */}
</button>
```

## 🔍 Vérification sur GitHub

Vous pouvez vérifier le code directement sur GitHub :

**URL :** https://github.com/alexis-dupre/engie-company-mapper/blob/claude/fix-admin-login-display-011CUmaAJbPPQP3r7YB97ezq/app/admin/dashboard/page.tsx#L112-L133

Le bouton est bien présent dans le code pushé sur GitHub.
