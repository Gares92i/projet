import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  ssl: {
    rejectUnauthorized: false,
  },
};

// Pour les migrations CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
