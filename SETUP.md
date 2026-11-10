# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install PostgreSQL
Download and install PostgreSQL from: https://www.postgresql.org/download/

### Step 2: Create Database
Open PostgreSQL command line (psql) and run:
\`\`\`sql
CREATE DATABASE services_marketplace;
\`\`\`

### Step 3: Import Database Schema
Navigate to the server directory and run:
\`\`\`bash
psql -U postgres -d services_marketplace -f database/schema.sql
\`\`\`

OR manually:
1. Open pgAdmin or psql
2. Connect to services_marketplace database
3. Copy and paste the contents of `server/database/schema.sql`
4. Execute the SQL

### Step 4: Configure Environment
The `.env` file is already created in the `server` directory.

**Update these values in `server/.env`:**
- `DB_PASSWORD` - Your PostgreSQL password
- `DB_USER` - Your PostgreSQL username (usually 'postgres')

### Step 5: Install Dependencies

**Backend:**
\`\`\`bash
cd server
npm install
\`\`\`

**Frontend:**
\`\`\`bash
cd client
npm install
\`\`\`

### Step 6: Start the Application

Open TWO terminal windows:

**Terminal 1 (Backend):**
\`\`\`bash
cd server
npm start
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd client
npm run dev
\`\`\`

### Step 7: Access the Application

Open your browser and go to: **http://localhost:5173**

### Step 8: Login

Use the default admin account:
- **Email:** admin@marketplace.com
- **Password:** admin123

## ✅ Testing the Features

### As Admin:
1. Login with admin credentials
2. Go to "Providers" tab
3. Approve pending provider registrations
4. View dashboard statistics

### As Provider:
1. Register a new account (select "Service Provider")
2. Wait for admin approval (or approve yourself from admin panel)
3. Login and add services
4. Manage bookings

### As Customer:
1. Register a new account (select "Customer")
2. Search for providers
3. View provider details
4. Book a service
5. Track bookings in dashboard

## 🔧 Troubleshooting

### Database Connection Error
- Check if PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use
- Backend: Change `PORT` in `server/.env`
- Frontend: Port will auto-increment if 5173 is busy

### Module Not Found
- Run `npm install` in both client and server directories

## 📞 Need Help?

Check the main README.md for detailed documentation.
