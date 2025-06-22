const { Client } = require('pg');
require('dotenv').config();

async function inspectSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connexion à la base de données établie');

    // Liste des tables
    const tableQuery = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    console.log('\n===== TABLES DISPONIBLES =====');
    tableQuery.rows.forEach(row => console.log(row.table_name));

    // Pour chaque table, afficher sa structure
    for (const row of tableQuery.rows) {
      const tableName = row.table_name;
      const columnQuery = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log(`\n===== STRUCTURE DE LA TABLE: ${tableName} =====`);
      columnQuery.rows.forEach(col => {
        console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'inspection du schéma:', error);
  } finally {
    await client.end();
  }
}

inspectSchema();