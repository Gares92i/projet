const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function generateEntities() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connexion à la base de données établie');

    // Liste des tables
    const tableQuery = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name != 'migrations'
    `);

    for (const row of tableQuery.rows) {
      const tableName = row.table_name;
      const columnQuery = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Déterminer le nom de classe (singulier, PascalCase)
      const className = toClassName(tableName);
      
      // Déterminer le chemin du fichier
      const moduleName = getModuleName(tableName);
      const entityDir = path.join(__dirname, 'src', moduleName, 'entities');
      fs.mkdirSync(entityDir, { recursive: true });

      const entityPath = path.join(entityDir, `${getSingular(tableName)}.entity.ts`);
      
      // Générer le contenu de l'entité
      let entityContent = `import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('${tableName}')
export class ${className} {
`;

      // Générer les propriétés
      columnQuery.rows.forEach(col => {
        const propName = toCamelCase(col.column_name);
        const tsType = getTypeScriptType(col.data_type);
        
        // ID avec génération UUID
        if (col.column_name === 'id' && col.column_default?.includes('uuid_generate_v4()')) {
          entityContent += `  @PrimaryGeneratedColumn('uuid')\n  id: string;\n\n`;
        }
        // Timestamps spéciaux
        else if (col.column_name === 'created_at') {
          entityContent += `  @CreateDateColumn({ name: 'created_at' })\n  createdAt: Date;\n\n`;
        }
        else if (col.column_name === 'updated_at') {
          entityContent += `  @UpdateDateColumn({ name: 'updated_at' })\n  updatedAt: Date;\n\n`;
        }
        // Colonnes standards
        else {
          const options = [];
          
          // Ajouter le nom de colonne si différent du nom de propriété
          if (col.column_name !== propName) {
            options.push(`name: '${col.column_name}'`);
          }
          
          // Nullable
          if (col.is_nullable === 'YES') {
            options.push('nullable: true');
          }
          
          // Type spécial
          if (col.data_type === 'jsonb' || col.data_type === 'json') {
            options.push(`type: '${col.data_type}'`);
          }
          
          // Valeur par défaut
          if (col.column_default && !col.column_default.includes('nextval')) {
            if (col.data_type === 'boolean') {
              options.push(`default: ${col.column_default.includes('true')}`);
            } else if (col.data_type === 'integer' || col.data_type === 'numeric') {
              options.push(`default: ${col.column_default}`);
            } else if (col.column_default.includes("'")) {
              const defaultValue = col.column_default.replace(/^'|'::.*$/g, '');
              options.push(`default: '${defaultValue}'`);
            }
          }
          
          const optionsStr = options.length > 0 ? `{ ${options.join(', ')} }` : '';
          entityContent += `  @Column(${optionsStr})\n  ${propName}: ${tsType};\n\n`;
        }
      });
      
      entityContent += '}\n';
      
      // Écrire le fichier
      fs.writeFileSync(entityPath, entityContent);
      console.log(`Entité générée: ${entityPath}`);
    }
  } catch (error) {
    console.error('Erreur lors de la génération des entités:', error);
  } finally {
    await client.end();
  }
}

// Fonctions utilitaires
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toClassName(tableName) {
  return toCamelCase(getSingular(tableName)).replace(/^[a-z]/, c => c.toUpperCase());
}

function getSingular(tableName) {
  // Règles de base pour le singulier en anglais
  if (tableName.endsWith('ies')) return tableName.slice(0, -3) + 'y';
  if (tableName.endsWith('s') && !tableName.endsWith('ss')) return tableName.slice(0, -1);
  return tableName;
}

function getModuleName(tableName) {
  // Determiner le nom du module (pluriel)
  const base = tableName.split('_')[0];
  return base.endsWith('s') ? base : base + 's';
}

function getTypeScriptType(pgType) {
  const typeMap = {
    'uuid': 'string',
    'character varying': 'string',
    'text': 'string',
    'integer': 'number',
    'numeric': 'number',
    'boolean': 'boolean',
    'jsonb': 'any',
    'json': 'any',
    'date': 'Date',
    'timestamp with time zone': 'Date',
    'timestamp without time zone': 'Date',
  };
  
  return typeMap[pgType] || 'any';
}

generateEntities();