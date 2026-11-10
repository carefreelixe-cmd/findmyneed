#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function addSpecialtiesColumn() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();

    console.log('📝 Adding specialties column to providers table...');
    await client.query(`ALTER TABLE providers ADD COLUMN IF NOT EXISTS specialties TEXT[];`);
    
    console.log('✅ Specialties column added successfully!');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (client) await client.end();
    process.exit(1);
  }
}

addSpecialtiesColumn();
