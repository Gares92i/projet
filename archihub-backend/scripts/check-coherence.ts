import { Project } from 'ts-morph';
import { Client } from 'pg';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

// === CONFIGURATION ===
const SRC_DIR = path.join(__dirname, '../src');
const FRONTEND_TYPES_ROOT = path.join(__dirname, '../../src/features');
const PG_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

function getAllDirs(dir: string) {
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());
}
function getAllFiles(dir: string, ext = '.ts') {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(ext)).map(f => path.join(dir, f));
}

async function getTableColumns(table: string) {
  const client = new Client(PG_CONFIG);
  await client.connect();
  const res = await client.query(
    `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position;`,
    [table]
  );
  await client.end();
  return res.rows;
}

(async () => {
  const project = new Project();
  const modules = getAllDirs(SRC_DIR);
  for (const mod of modules) {
    const entitiesDir = path.join(SRC_DIR, mod, 'entities');
    const dtoDir = path.join(SRC_DIR, mod, 'dto');
    const frontendTypesDir = path.join(FRONTEND_TYPES_ROOT, mod, 'types');
    const entityFiles = getAllFiles(entitiesDir);
    for (const file of entityFiles) {
      const source = project.addSourceFileAtPath(file);
      const entityClass = source.getClasses()[0];
      if (!entityClass) continue;
      const entityName = entityClass.getName();
      const tableDecorator = entityClass.getDecorator('Entity');
      const tableName = tableDecorator?.getArguments()[0]?.getText().replace(/['"]/g, '') || entityName.toLowerCase();
      const props = entityClass.getProperties().map(p => p.getName());
      // 1. SQL
      const sqlCols = await getTableColumns(tableName).catch(() => []);
      const sqlColNames = sqlCols.map(c => c.column_name);
      const missingInSQL = props.filter(p => !sqlColNames.includes(p));
      const missingInEntity = sqlColNames.filter(c => !props.includes(c));
      if (missingInSQL.length || missingInEntity.length) {
        console.log(chalk.yellow(`\n[${entityName}] Diff entité <-> SQL (${tableName})`));
        if (missingInSQL.length) console.log(chalk.red('  Champs dans entité mais pas en SQL :'), missingInSQL);
        if (missingInEntity.length) console.log(chalk.red('  Champs en SQL mais pas dans entité :'), missingInEntity);
      } else {
        console.log(chalk.green(`[${entityName}] OK : entité et table SQL synchronisées.`));
      }
      // 2. DTO
      const dtoFiles = getAllFiles(dtoDir);
      for (const dtoFile of dtoFiles) {
        const dtoSource = project.addSourceFileAtPath(dtoFile);
        const dtoClass = dtoSource.getClasses()[0];
        if (!dtoClass) continue;
        const dtoName = dtoClass.getName();
        const dtoProps = dtoClass.getProperties().map(p => p.getName());
        const missingInDTO = props.filter(p => !dtoProps.includes(p));
        const missingInEntityFromDTO = dtoProps.filter(p => !props.includes(p));
        if (missingInDTO.length || missingInEntityFromDTO.length) {
          console.log(chalk.cyan(`  [${dtoName}] Diff DTO <-> Entité`));
          if (missingInDTO.length) console.log(chalk.red('    Champs dans entité mais pas dans DTO :'), missingInDTO);
          if (missingInEntityFromDTO.length) console.log(chalk.red('    Champs dans DTO mais pas dans entité :'), missingInEntityFromDTO);
        } else {
          console.log(chalk.green(`  [${dtoName}] OK : DTO et entité synchronisées.`));
        }
      }
      // 3. Types frontend
      const frontendTypeFiles = getAllFiles(frontendTypesDir);
      for (const typeFile of frontendTypeFiles) {
        const typeSource = project.addSourceFileAtPath(typeFile);
        const interfaces = typeSource.getInterfaces();
        for (const iface of interfaces) {
          const ifaceName = iface.getName();
          const ifaceProps = iface.getProperties().map(p => p.getName());
          const missingInType = props.filter(p => !ifaceProps.includes(p));
          const missingInEntityFromType = ifaceProps.filter(p => !props.includes(p));
          if (missingInType.length || missingInEntityFromType.length) {
            console.log(chalk.magenta(`    [${ifaceName}] Diff Type Frontend <-> Entité`));
            if (missingInType.length) console.log(chalk.red('      Champs dans entité mais pas dans type :'), missingInType);
            if (missingInEntityFromType.length) console.log(chalk.red('      Champs dans type mais pas dans entité :'), missingInEntityFromType);
          } else {
            console.log(chalk.green(`    [${ifaceName}] OK : type frontend et entité synchronisés.`));
          }
        }
      }
    }
  }
})(); 