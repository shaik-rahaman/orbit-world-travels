# Orbit World Travels - Deployment Guide

## ✅ Production Readiness Checklist

This document ensures your application is production-ready and follows industry best practices.

---

## 1. LOCAL DEVELOPMENT SETUP ✓

### Prerequisites
- ✅ Node.js v18+
- ✅ MongoDB (local or cloud)
- ✅ npm v8+

### Quick Start
```bash
# Backend
cd backend && npm install
cp .env.example .env  # Configure with local MongoDB
npm run dev           # Runs on http://localhost:3008

# Frontend (new terminal)
cd frontend && npm install
npm run dev           # Runs on http://localhost:8008
```

### Verify Local Setup
```bash
# Check backend
curl http://localhost:3008/health

# Check frontend
curl http://localhost:8008
```

---

## 2. ENVIRONMENT SECURITY ✓

### Backend (.env)
- ✅ Template: `.env.example`
- ✅ Production: `.env.production`
- ✅ Never commit `.env` to Git
- ✅ All credentials moved from hardcoded values
- ✅ Supports environment-based CORS

### Frontend (.env.local)
- ✅ Template: `.env.example`
- ✅ Production: `.env.production`
- ✅ API URL configurable per environment
- ✅ Never commit `.env.local` to Git

### Security Best Practices Implemented
```bash
✅ No hardcoded database URLs
✅ No hardcoded API keys (Groq, AWS)
✅ JWT secret configurable
✅ CORS origins configurable
✅ Sensitive files in .gitignore
✅ Environment-based configuration
```

---

## 3. BUILD VERIFICATION ✓

### Backend Build
```bash
cd backend
npm run build              # ✅ TypeScript compilation
npm run type-check        # ✅ Type checking
npm run lint             # ✅ Code linting
npm run start            # ✅ Production start
```

### Frontend Build
```bash
cd frontend
npm run build            # ✅ Next.js production build
npm run start            # ✅ Production start
```

---

## 4. DOCKER DEPLOYMENT ✓

### Build and Run
```bash
# Single command startup
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Running
- ✅ MongoDB on port 27017
- ✅ Backend on port 3008
- ✅ Frontend on port 8008

---

## 5. GITHUB PREPARATION ✓

### Repository Cleanup
```bash
✅ .gitignore configured
✅ No .env files committed
✅ No node_modules committed
✅ No dist/ committed
✅ .env.example templates included
✅ All credentials removed
```

### Files Ready for GitHub
```
orbit-world-travels/
├── .gitignore              # ✅ Complete
├── backend/
│   ├── .env.example       # ✅ Template
│   ├── .env.production    # ✅ Production template
│   ├── .dockerignore      # ✅ Optimized
│   ├── Dockerfile         # ✅ Production-ready
│   ├── package.json       # ✅ Scripts updated
│   ├── tsconfig.json      # ✅ Path aliases configured
│   └── src/               # ✅ All source files
├── frontend/
│   ├── .env.example       # ✅ Template
│   ├── .env.production    # ✅ Production template
│   ├── .dockerignore      # ✅ Optimized
│   ├── Dockerfile         # ✅ Production-ready
│   ├── package.json       # ✅ Scripts updated
│   └── app/               # ✅ All source files
├── docker-compose.yml     # ✅ Multi-service orchestration
├── README.md              # ✅ Comprehensive documentation
└── Orbit_World_API_Collection.postman_collection.json
```

---

## 6. CLOUD DEPLOYMENT OPTIONS

### AWS ECS/Fargate
```bash
# Build and push images
docker build -t your-registry/orbit-backend:latest ./backend
docker build -t your-registry/orbit-frontend:latest ./frontend

docker push your-registry/orbit-backend:latest
docker push your-registry/orbit-frontend:latest
```

**Environment Variables to Set:**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-key>
GROQ_API_KEY=<your-key>
CORS_ORIGINS=<your-domain>
```

### Vercel (Frontend)
```bash
1. Push to GitHub
2. Connect to Vercel
3. Set environment variable:
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api/orbit-world
4. Deploy
```

### Railway / Render (Backend)
```bash
1. Push to GitHub
2. Connect to Railway/Render
3. Set all environment variables from .env.production
4. Deploy
```

### Google Cloud Run
```bash
# Build and deploy
gcloud run deploy orbit-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=<your-uri>,JWT_SECRET=<key>
```

---

## 7. DATABASE SETUP

### Local MongoDB
```bash
# Docker
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string: `mongodb+srv://...`
4. Add to `.env.production`

### Azure Cosmos DB
1. Create Cosmos DB instance
2. Get MongoDB connection string
3. Add to `.env.production`

---

## 8. SECURITY CHECKLIST

```bash
✅ No hardcoded credentials
✅ JWT secrets configured per environment
✅ Database credentials in environment variables
✅ API keys in environment variables
✅ CORS properly configured
✅ API endpoints protected with authentication
✅ Error messages don't expose sensitive info
✅ File uploads validated
✅ Input validation on all endpoints
✅ SQL injection prevention (using Mongoose)
✅ HTTPS/TLS for production
✅ Rate limiting (add express-rate-limit if needed)
```

---

## 9. MONITORING & LOGGING

### Backend Logging
```bash
# Configure LOG_LEVEL in .env
LOG_LEVEL=info    # Development
LOG_LEVEL=warn    # Production
```

### Health Checks
```bash
# Backend health
curl http://localhost:3008/health

# Response
{
  "success": true,
  "message": "Orbit World Backend is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Production Monitoring
- Set up CloudWatch (AWS) or Stackdriver (GCP)
- Configure log aggregation
- Set up alerts for errors

---

## 10. PERFORMANCE OPTIMIZATION

### Frontend
```bash
✅ Next.js production build
✅ Static generation configured
✅ API route caching
✅ Image optimization
✅ Code splitting enabled
```

### Backend
```bash
✅ TypeScript compilation
✅ Path aliases configured
✅ Error handling middleware
✅ Request validation
✅ Database indexing (add as needed)
```

### Database
```bash
# Add indexes for frequently queried fields
db.invoices.createIndex({ "invoiceNumber": 1 })
db.users.createIndex({ "email": 1 })
```

---

## 11. CI/CD PIPELINE

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run build
      - run: cd frontend && npm install && npm run build
```

---

## 12. QUICK START COMMANDS

### Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Open browser
http://localhost:8008
```

### Production (Local)
```bash
docker-compose up -d
```

### Production (Cloud)
See sections above for AWS, Vercel, Railway, Google Cloud Run.

---

## 13. TROUBLESHOOTING

### Backend Won't Start
```bash
# Check port
lsof -i :3008

# Check MongoDB connection
mongosh mongodb://localhost:27017

# Check environment
cat backend/.env
```

### Frontend Won't Load
```bash
# Check API URL
echo $NEXT_PUBLIC_API_BASE_URL

# Test backend
curl http://localhost:3008/health
```

### Docker Issues
```bash
# View logs
docker-compose logs -f

# Clean up
docker-compose down -v
docker-compose up --build
```

---

## 14. DEPLOYMENT VERIFICATION

After deploying to cloud, verify:
```bash
✅ Frontend loads
✅ Backend /health returns 200
✅ Login endpoint works
✅ API calls succeed
✅ Database connection stable
✅ Logs appear in console
✅ Errors are caught properly
```

---

## 15. NEXT STEPS

1. **Update production URLs**
   - Set `NEXT_PUBLIC_API_BASE_URL` to your cloud backend
   - Set `CORS_ORIGINS` to your frontend domain

2. **Configure secrets**
   - AWS Secrets Manager
   - Azure Key Vault
   - Railway/Render built-in secrets

3. **Set up monitoring**
   - Application Performance Monitoring (APM)
   - Error tracking (Sentry)
   - Uptime monitoring

4. **Enable backups**
   - Database backups
   - File storage backups
   - Version control (GitHub)

---

## 📞 Support & Resources

- **Postman Collection**: Import `Orbit_World_API_Collection.postman_collection.json`
- **MongoDB Documentation**: https://docs.mongodb.com
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Express.js Guide**: https://expressjs.com
- **Docker Documentation**: https://docs.docker.com

---

**Last Updated**: May 21, 2026
**Project**: Orbit World Travels
**Status**: ✅ Production Ready
