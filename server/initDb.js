#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function initializeDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();

    // Drop existing database if it exists
    console.log('🗑️  Dropping existing database (if exists)...');
    await client.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME} WITH (FORCE);`);

    // Create database
    console.log('📦 Creating database...');
    await client.query(`CREATE DATABASE ${process.env.DB_NAME};`);

    await client.end();

    // Connect to the new database
    const dataClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('🔌 Connecting to new database...');
    await dataClient.connect();

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📋 Executing schema...');
    await dataClient.query(schema);

    console.log('✅ Database initialized successfully!');
    console.log('\n🎉 Setup Complete!');
    console.log('📧 Admin Email: admin@marketplace.com');
    console.log('🔐 Admin Password: admin123');
    console.log('\nYou can now start the server with: npm run dev');

    await dataClient.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    if (client) await client.end();
    process.exit(1);
  }
}

initializeDatabase();
