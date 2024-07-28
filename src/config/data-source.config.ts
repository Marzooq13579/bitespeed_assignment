import { DataSource } from 'typeorm';
import { Contact } from '../database/entities/contact.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'user',
  password: 'password',
  database: 'bitespeed',
  entities: [Contact],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
