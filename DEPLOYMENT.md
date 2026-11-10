# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Server with Node.js installed
- PostgreSQL database
- Domain name (optional)
- SSL certificate (recommended)

## Option 1: Traditional VPS Deployment

### 1. Server Setup

**Install Node.js:**
\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

**Install PostgreSQL:**
\`\`\`bash
sudo apt-get install postgresql postgresql-contrib
\`\`\`

**Install PM2 (Process Manager):**
\`\`\`bash
sudo npm install -g pm2
\`\`\`

### 2. Database Setup

\`\`\`bash
sudo -u postgres psql
CREATE DATABASE services_marketplace;
CREATE USER marketplace_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE services_marketplace TO marketplace_user;
\\q
\`\`\`

Import schema:
\`\`\`bash
psql -U marketplace_user -d services_marketplace -f server/database/schema.sql
\`\`\`

### 3. Application Deployment

**Clone repository:**
\`\`\`bash
git clone <your-repo-url>
cd MaderChod
\`\`\`

**Backend setup:**
\`\`\`bash
cd server
npm install --production
\`\`\`

**Update .env for production:**
\`\`\`env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=marketplace_user
DB_PASSWORD=secure_password
DB_NAME=services_marketplace
JWT_SECRET=your_very_secure_production_secret_key_here
FRONTEND_URL=https://yourdomain.com
\`\`\`

**Start backend with PM2:**
\`\`\`bash
pm2 start server.js --name marketplace-api
pm2 save
pm2 startup
\`\`\`

**Frontend setup:**
\`\`\`bash
cd ../client
npm install
npm run build
\`\`\`

### 4. Nginx Configuration

**Install Nginx:**
\`\`\`bash
sudo apt-get install nginx
\`\`\`

**Create Nginx config:**
\`\`\`bash
sudo nano /etc/nginx/sites-available/marketplace
\`\`\`

Add:
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /path/to/MaderChod/client/dist;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

**Enable site:**
\`\`\`bash
sudo ln -s /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### 5. SSL Certificate (Let's Encrypt)

\`\`\`bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

---

## Option 2: AWS Deployment

### Architecture Components
1. **EC2** - Application server
2. **RDS** - PostgreSQL database
3. **S3** - Static file storage
4. **CloudFront** - CDN
5. **Route 53** - DNS management

### 1. RDS Setup

1. Create PostgreSQL RDS instance
2. Note endpoint, username, password
3. Security group: Allow port 5432 from EC2
4. Import schema using pgAdmin or psql

### 2. EC2 Setup

**Launch EC2 instance:**
- AMI: Ubuntu Server 22.04
- Instance type: t3.medium (or higher)
- Security group: Allow HTTP (80), HTTPS (443), SSH (22)

**Connect and setup:**
\`\`\`bash
ssh -i your-key.pem ubuntu@your-ec2-ip
\`\`\`

Follow VPS deployment steps above, but update .env with RDS endpoint:
\`\`\`env
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=postgres
DB_PASSWORD=your-rds-password
\`\`\`

### 3. S3 & CloudFront (Optional)

**Build frontend:**
\`\`\`bash
cd client
npm run build
\`\`\`

**Upload to S3:**
\`\`\`bash
aws s3 sync dist/ s3://your-bucket-name/
\`\`\`

**Create CloudFront distribution** pointing to S3 bucket

---

## Option 3: Heroku Deployment

### Backend (API)

**Create Heroku app:**
\`\`\`bash
heroku create marketplace-api
\`\`\`

**Add PostgreSQL:**
\`\`\`bash
heroku addons:create heroku-postgresql:mini
\`\`\`

**Set environment variables:**
\`\`\`bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set FRONTEND_URL=https://your-frontend.netlify.app
\`\`\`

**Create Procfile:**
\`\`\`
web: node server/server.js
\`\`\`

**Deploy:**
\`\`\`bash
git push heroku main
\`\`\`

**Import schema:**
\`\`\`bash
heroku pg:psql < server/database/schema.sql
\`\`\`

### Frontend (Netlify/Vercel)

**Update API endpoint:**
In `client/src/context/AuthContext.jsx` and controller files, replace:
\`\`\`javascript
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
\`\`\`

**Build and deploy:**

**Netlify:**
\`\`\`bash
cd client
npm run build
netlify deploy --prod --dir=dist
\`\`\`

**Vercel:**
\`\`\`bash
cd client
vercel --prod
\`\`\`

---

## Option 4: Docker Deployment

### 1. Create Docker files

**Backend Dockerfile:**
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
\`\`\`

**Frontend Dockerfile:**
\`\`\`dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

### 2. Docker Compose

**docker-compose.yml:**
\`\`\`yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: services_marketplace
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: services_marketplace
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
\`\`\`

**Run:**
\`\`\`bash
docker-compose up -d
\`\`\`

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Use environment variables
- [ ] Enable logging
- [ ] Set up monitoring

## 📊 Monitoring

**PM2 monitoring:**
\`\`\`bash
pm2 monit
pm2 logs
\`\`\`

**Database monitoring:**
\`\`\`bash
sudo systemctl status postgresql
\`\`\`

## 🔄 Updates & Maintenance

**Update code:**
\`\`\`bash
git pull origin main
cd server && npm install
pm2 restart marketplace-api
\`\`\`

**Database backup:**
\`\`\`bash
pg_dump -U marketplace_user services_marketplace > backup_$(date +%Y%m%d).sql
\`\`\`

**Restore backup:**
\`\`\`bash
psql -U marketplace_user services_marketplace < backup_20260103.sql
\`\`\`

## 📈 Performance Optimization

1. **Enable PostgreSQL connection pooling** (already configured)
2. **Add Redis caching** (optional)
3. **Enable Gzip compression** in Nginx
4. **Use CDN** for static assets
5. **Optimize database queries** with indexes (already added)
6. **Enable PM2 cluster mode** for multi-core usage

---

## 🆘 Troubleshooting

**Port conflicts:**
\`\`\`bash
sudo lsof -i :5000
kill -9 <PID>
\`\`\`

**Database connection issues:**
\`\`\`bash
sudo systemctl restart postgresql
\`\`\`

**PM2 not starting:**
\`\`\`bash
pm2 delete all
pm2 start server.js
\`\`\`

**Nginx errors:**
\`\`\`bash
sudo nginx -t
sudo systemctl status nginx
\`\`\`

---

For detailed support, check the README.md or contact the development team.
