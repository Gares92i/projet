const { Pool } = require('pg');

// Configuration de la base de données (à adapter selon ton environnement)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/archihub',
});

async function debugPermissions() {
  try {
    console.log('🔍 Diagnostic des permissions et authentification...\n');

    // 1. Vérifier les utilisateurs Clerk
    console.log('1. Utilisateurs Clerk:');
    const usersResult = await pool.query('SELECT id, "clerkId", "firstName", "lastName", email FROM users_clerk LIMIT 5');
    console.log(usersResult.rows);

    // 2. Vérifier les membres d'agence
    console.log('\n2. Membres d\'agence:');
    const membersResult = await pool.query('SELECT id, user_id, owner_id, role, status, permissions FROM agency_members LIMIT 5');
    console.log(membersResult.rows);

    // 3. Vérifier les paramètres d'entreprise
    console.log('\n3. Paramètres d\'entreprise:');
    const settingsResult = await pool.query('SELECT id, owner_id, company_name FROM company_settings LIMIT 5');
    console.log(settingsResult.rows);

    // 4. Vérifier les permissions d'un utilisateur spécifique
    const testUserId = 'user_2ypZXnHwTR3NdG5oM3FmQbKW9eM'; // Remplacer par l'ID de test
    console.log(`\n4. Permissions pour ${testUserId}:`);
    
    // Trouver l'UUID interne
    const userResult = await pool.query('SELECT id FROM users_clerk WHERE "clerkId" = $1', [testUserId]);
    if (userResult.rows.length > 0) {
      const internalUserId = userResult.rows[0].id;
      console.log(`UUID interne: ${internalUserId}`);
      
      // Vérifier les permissions
      const permissionsResult = await pool.query('SELECT * FROM agency_members WHERE user_id = $1', [internalUserId]);
      if (permissionsResult.rows.length > 0) {
        console.log('Permissions trouvées:', permissionsResult.rows[0]);
      } else {
        console.log('❌ Aucun membre d\'agence trouvé pour cet utilisateur');
      }
    } else {
      console.log('❌ Utilisateur Clerk non trouvé');
    }

    // 5. Créer un membre d'agence de test si nécessaire
    console.log('\n5. Création d\'un membre d\'agence de test...');
    const testMember = {
      user_id: userResult.rows[0]?.id || '6edda20e-16d3-412f-8434-b2210376f087',
      owner_id: 'user_2ypZXnHwTR3NdG5oM3FmQbKW9eM',
      role: 'admin',
      status: 'active',
      permissions: JSON.stringify({
        clients: true,
        projects: true,
        stats: true,
        documents: true
      })
    };

    // Vérifier si le membre existe déjà
    const existingMember = await pool.query('SELECT id FROM agency_members WHERE user_id = $1', [testMember.user_id]);
    if (existingMember.rows.length === 0) {
      await pool.query(`
        INSERT INTO agency_members (user_id, owner_id, role, status, permissions, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [testMember.user_id, testMember.owner_id, testMember.role, testMember.status, testMember.permissions]);
      console.log('✅ Membre d\'agence de test créé');
    } else {
      console.log('ℹ️ Membre d\'agence existe déjà');
    }

    // 6. Créer des paramètres d'entreprise de test si nécessaire
    console.log('\n6. Création de paramètres d\'entreprise de test...');
    const existingSettings = await pool.query('SELECT id FROM company_settings WHERE owner_id = $1', [testUserId]);
    if (existingSettings.rows.length === 0) {
      await pool.query(`
        INSERT INTO company_settings (owner_id, company_name, address, logo_url, subscription_plan, subscription_status, max_members_allowed, default_user_role, branding, architect_info, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      `, [
        testUserId,
        'ArchiHub Studio',
        '45 rue de l\'Architecture, 75001 Paris, France',
        null,
        'pro',
        'active',
        10,
        'member',
        '{}',
        '{}'
      ]);
      console.log('✅ Paramètres d\'entreprise de test créés');
    } else {
      console.log('ℹ️ Paramètres d\'entreprise existent déjà');
    }

    console.log('\n✅ Diagnostic terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await pool.end();
  }
}

debugPermissions(); 