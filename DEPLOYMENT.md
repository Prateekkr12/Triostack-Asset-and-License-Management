# 🚀 Triostack Asset & License Manager - Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the Triostack Asset & License Manager application to production environments.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Vercel)    │    Backend (Render)    │   Database     │
│  ┌─────────────────┐  │   ┌─────────────────┐  │  ┌─────────┐   │
│  │  Next.js App    │  │   │  Express API    │  │  │ MongoDB │   │
│  │  (Static Host)  │◄─┼──►│  (Node.js)      │◄─┼──┤ Atlas   │   │
│  │                 │  │   │                 │  │  │         │   │
│  └─────────────────┘  │   └─────────────────┘  │  └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Deployment Options

### Option 1: Recommended (Cloud Platforms)

#### Frontend: Vercel
#### Backend: Render/AWS EC2
#### Database: MongoDB Atlas

### Option 2: Self-Hosted (VPS/Dedicated Server)

#### All Services: Single VPS with Docker

---

## 🌐 Option 1: Cloud Deployment (Recommended)

### 1. Frontend Deployment (Vercel)

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: `Next.js`
     - Build Command: `cd frontend && npm run build`
     - Output Directory: `frontend/out`
     - Install Command: `cd frontend && npm install`

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_APP_NAME=Triostack Asset Manager
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-app.vercel.app`

### 2. Backend Deployment (Render)

#### Prerequisites
- Render account
- GitHub repository

#### Steps

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```yaml
   Name: triostack-asset-manager-backend
   Environment: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Plan: Starter (Free) or Professional
   ```

3. **Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   PORT=10000
   
   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@triostack.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Your API will be available at `https://your-service.onrender.com`

### 3. Database Setup (MongoDB Atlas)

#### Prerequisites
- MongoDB Atlas account

#### Steps

1. **Create Cluster**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a new cluster
   - Choose AWS/GCP/Azure provider
   - Select region closest to your users

2. **Configure Database Access**
   ```javascript
   // Create database user
   Username: triostack-admin
   Password: [Generate secure password]
   Database User Privileges: Read and write to any database
   ```

3. **Configure Network Access**
   ```
   IP Access List: 0.0.0.0/0 (Allow access from anywhere)
   Or add specific IPs for better security
   ```

4. **Get Connection String**
   ```
   mongodb+srv://triostack-admin:<password>@cluster0.xxxxx.mongodb.net/triostack-asset-manager?retryWrites=true&w=majority
   ```

---

## 🐳 Option 2: Self-Hosted Deployment (Docker)

### Prerequisites
- VPS with Docker and Docker Compose
- Domain name (optional)
- SSL certificate (Let's Encrypt)

### Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/triostack-asset-manager.git
   cd triostack-asset-manager
   ```

2. **Configure Environment**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   
   # Edit backend/.env
   nano backend/.env
   ```

3. **Update Environment Variables**
   ```env
   # backend/.env
   MONGODB_URI=mongodb://mongodb:27017/triostack-asset-manager
   JWT_SECRET=your-super-secure-jwt-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   CORS_ORIGIN=http://your-domain.com
   
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://your-domain.com:8000/api
   ```

4. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Setup Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🔧 Production Configuration

### Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database authentication
- [ ] Regular security updates
- [ ] Backup strategy in place

### Performance Optimization

- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Configure caching headers
- [ ] Database indexing
- [ ] Image optimization
- [ ] Code splitting

### Monitoring

- [ ] Application monitoring (Sentry, LogRocket)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Database monitoring
- [ ] Error tracking
- [ ] Performance metrics

---

## 📊 Post-Deployment

### 1. Initial Setup

1. **Access Application**
   - Navigate to your deployed frontend URL
   - Login with default admin credentials:
     - Email: `admin@triostack.com`
     - Password: `admin123`

2. **Change Default Password**
   - Go to Profile Settings
   - Update admin password
   - Update admin email if needed

3. **Configure Organization**
   - Update organization details
   - Configure departments
   - Set up email notifications

### 2. Data Migration (if applicable)

```bash
# If migrating from existing system
# Export data and import using MongoDB tools
mongoimport --uri="your-connection-string" --collection=users --file=users.json
mongoimport --uri="your-connection-string" --collection=assets --file=assets.json
```

### 3. Backup Strategy

```bash
# Daily automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your-connection-string" --out="/backups/triostack_$DATE"
```

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```
   Solution: Update CORS_ORIGIN in backend environment
   ```

2. **Database Connection Issues**
   ```
   Solution: Check MongoDB URI and network access
   ```

3. **Authentication Failures**
   ```
   Solution: Verify JWT_SECRET and token expiration
   ```

4. **Email Notifications Not Working**
   ```
   Solution: Configure SMTP settings and test connection
   ```

### Logs and Debugging

```bash
# Backend logs
docker logs triostack-backend

# Frontend logs
docker logs triostack-frontend

# Database logs
docker logs triostack-mongodb
```

---

## 📞 Support

For deployment support:
- 📧 Email: support@triostack.com
- 📚 Documentation: [docs.triostack.com](https://docs.triostack.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🎯 Next Steps

After successful deployment:

1. **Set up monitoring and alerts**
2. **Configure automated backups**
3. **Train your team on the system**
4. **Plan for scaling as you grow**
5. **Regular security audits**

---

*Last updated: October 2024*
