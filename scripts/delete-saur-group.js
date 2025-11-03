/**
 * Script pour supprimer un groupe Saur
 */

const { Redis } = require('@upstash/redis');

async function main() {
  // Initialiser Redis
  const redis = Redis.fromEnv();

  try {
    // Récupérer tous les groupes
    console.log('Recherche des groupes Saur...');
    const keys = await redis.keys('group:*');

    if (keys.length === 0) {
      console.log('Aucun groupe trouvé');
      return;
    }

    // Charger tous les groupes
    const groups = await Promise.all(
      keys.map(async (key) => {
        const group = await redis.get(key);
        return { key, ...group };
      })
    );

    // Filtrer les groupes Saur
    const saurGroups = groups.filter(g => g && g.name === 'Saur');

    console.log(`\nGroupes Saur trouvés: ${saurGroups.length}`);
    saurGroups.forEach((g, idx) => {
      console.log(`${idx + 1}. ID: ${g.id}, Nom: ${g.name}, Créé: ${new Date(g.createdAt).toLocaleString()}`);
    });

    if (saurGroups.length === 0) {
      console.log('\nAucun groupe Saur trouvé');
      return;
    }

    // Supprimer le premier groupe Saur trouvé
    const groupToDelete = saurGroups[0];
    console.log(`\n🗑️  Suppression du groupe: ${groupToDelete.name} (${groupToDelete.id})`);

    // Supprimer le groupe et ses données associées
    await redis.del(`group:${groupToDelete.id}`);
    await redis.del(`comments:${groupToDelete.id}`);
    await redis.del(`tags:${groupToDelete.id}`);
    await redis.del(`company-comments:${groupToDelete.id}`);

    console.log('✅ Groupe supprimé avec succès!');

    // Vérifier qu'il reste bien un seul groupe Saur
    const remainingGroups = saurGroups.slice(1);
    console.log(`\nGroupes Saur restants: ${remainingGroups.length}`);
    remainingGroups.forEach((g, idx) => {
      console.log(`${idx + 1}. ID: ${g.id}, Nom: ${g.name}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
