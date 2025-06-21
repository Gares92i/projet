import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

// Utiliser process.cwd() au lieu de __dirname
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(process.cwd(), 'dist', '**', '*.entity.js')],
  migrations: [path.join(process.cwd(), 'dist', 'migrations', '*.js')],
});
