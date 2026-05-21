# Orbit World Travels

A comprehensive, production-grade travel operations and invoicing platform with AI-powered features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Modules
- **Invoice Management** - Financial year-based invoicing with automatic margin calculations
- **Visa Processing** - Applicant tracking and visa status management
- **Flight Bookings** - PNR tracking, ticket upload support, and booking management
- **Hotel Reservations** - Booking records with margin calculation
- **Insurance Policies** - Policy management and coverage tracking
- **CRM System** - Comprehensive client database with booking history
- **Reports & Analytics** - Sales reports, profit analysis, GST calculations, and dashboards

### AI-Powered Features
- **Document Processing** - Extract data from PDFs/images using LLM
- **AI Chatbot** - Natural language queries converted to SQL
- **Intelligent Data Extraction** - Automatic extraction from flight tickets, visas, hotel confirmations

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand |
| **Backend** | Node.js, Express, TypeScript, MongoDB, Mongoose |
| **Authentication** | JWT-based, Role-Based Access Control (RBAC) |
| **AI/ML** | Groq LLM (LLaMA 3 70B), Document Processing, SQL Generation |
| **DevOps** | Docker, Docker Compose, GitHub-ready |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18 or higher
- **MongoDB**: v5.0 or higher (local or cloud)
- **npm**: v8 or higher
- **Groq API Key**: Free from https://console.groq.com/

### Option 1: Local Development (Recommended)

#### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

#### 2. Setup Environment Variables

**Backend** - Create `backend/.env`:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

**Frontend** - Create `frontend/.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local (defaults are OK for local dev)
```

#### 3. Start MongoDB (Local)

```bash
# If MongoDB is installed locally
mongod
```

Or use Docker:
```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=orbittravels123 \
  mongo:7.0
```

#### 4. Start Backend

```bash
cd backend
npm run dev
# Backend runs at http://localhost:3008
```

#### 5. Start Frontend (in new terminal)

```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:8008
```

#### 6. Access the Application

- **Frontend**: http://localhost:8008
- **Backend API**: http://localhost:3008/api/orbit-world
- **Health Check**: http://localhost:3008/health

---

### Option 2: Docker Deployment (Production-Ready)

#### Prerequisites
- Docker and Docker Compose installed

#### 1. Configure Environment

Create `.env` in project root:
```env
NODE_ENV=production
PORT=3008

# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password

# JWT
JWT_SECRET=

# Groq AI
GROQ_API_KEY=

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3008/api/orbit-world
```

#### 2. Start All Services

```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 3. Verify Deployment

- **Frontend**: http://localhost:8008
- **Backend**: http://localhost:3008/health
- **MongoDB**: mongodb://admin:password@localhost:27017

---

## 🔧 Development

### Project Structure

```
orbit-world-travels/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app setup
│   │   ├── server.ts              # Server entry point
│   │   ├── config/                # Configuration files
│   │   ├── middleware/            # Auth, error handling
│   │   ├── modules/               # Feature modules
│   │   │   ├── auth/              # Authentication
│   │   │   ├── invoice/           # Invoicing
│   │   │   ├── visa/              # Visa processing
│   │   │   ├── flight/            # Flight bookings
│   │   │   ├── hotel/             # Hotel reservations
│   │   │   ├── insurance/         # Insurance policies
│   │   │   ├── crm/               # Client management
│   │   │   ├── reports/           # Analytics
│   │   │   └── ai/                # AI features
│   │   ├── models/                # Database schemas
│   │   ├── services/              # Business logic
│   │   └── types/                 # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── .dockerignore
│
├── frontend/
│   ├── app/                       # Next.js App Router
│   ├── components/                # React components
│   ├── constants/                 # App constants
│   ├── hooks/                     # Custom hooks
│   ├── services/                  # API client
│   ├── store/                     # Zustand state
│   ├── types/                     # TypeScript types
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── .dockerignore
│
├── docker-compose.yml             # Docker orchestration
├── .gitignore                     # Git ignore rules
├── README.md                      # This file
└── Orbit_World_API_Collection.postman_collection.json
```

### Available Scripts

**Backend**
```bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript
npm run start        # Production start
npm run lint         # Lint code
npm run format       # Format code
npm run type-check   # Type checking
```

**Frontend**
```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm run start        # Production start
npm run lint         # Lint code
```

---

## 📡 API Documentation

### Health Check
```bash
GET /health
```

### Authentication Endpoints
```bash
POST /api/orbit-world/auth/register    # User registration
POST /api/orbit-world/auth/login       # User login
GET  /api/orbit-world/auth/me          # Get current user
```

### Module Endpoints
```bash
/api/orbit-world/invoices   # Invoice management
/api/orbit-world/visa       # Visa processing
/api/orbit-world/flight     # Flight bookings
/api/orbit-world/hotel      # Hotel reservations
/api/orbit-world/insurance  # Insurance policies
/api/orbit-world/clients    # CRM
/api/orbit-world/reports    # Analytics
/api/orbit-world/ai         # AI features
```

### Postman Collection

Import `Orbit_World_API_Collection.postman_collection.json` in Postman for complete API testing.

---

## 🔒 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3008
CORS_ORIGINS=http://localhost:8008,http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=orbit_world_db

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# AI/LLM
GROQ_API_KEY=your-api-key
GROQ_MODEL=llama-3-70b-versatile

# AWS (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Logging
LOG_LEVEL=info
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3008/api/orbit-world
NEXT_PUBLIC_APP_NAME=Orbit World Travels
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 🐛 Troubleshooting

### Backend Won't Start

1. **Port 3008 already in use**
   ```bash
   lsof -i :3008
   kill -9 <PID>
   ```

2. **MongoDB connection failed**
   ```bash
   # Verify MongoDB is running
   mongosh
   ```

3. **TypeScript compilation errors**
   ```bash
   npm run type-check
   npm run build
   ```

### Frontend Won't Load

1. **API connection refused**
   - Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local` points to backend
   - Ensure backend is running: `curl http://localhost:3008/health`

2. **Port 8008 already in use**
   ```bash
   lsof -i :8008
   kill -9 <PID>
   ```

### Docker Issues

1. **Containers won't start**
   ```bash
   docker-compose logs -f
   docker-compose down -v  # Remove volumes
   docker-compose up --build
   ```

2. **Database connection from container**
   - Use service name: `mongodb:27017` (not localhost)
   - Already configured in docker-compose.yml

---

## 🚢 Cloud Deployment

### AWS Deployment (ECS/Fargate)

1. **Build and push Docker images**
   ```bash
   docker build -t your-registry/orbit-backend:latest ./backend
   docker build -t your-registry/orbit-frontend:latest ./frontend
   docker push your-registry/orbit-backend:latest
   docker push your-registry/orbit-frontend:latest
   ```

2. **Environment variables on cloud**
   - Set all `.env` variables in cloud environment
   - Ensure `CORS_ORIGINS` includes your domain

3. **Database**
   - Use managed MongoDB (MongoDB Atlas) or Azure Cosmos DB
   - Update `MONGODB_URI` with cloud connection string

### Vercel Deployment (Frontend)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set environment variable**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/orbit-world
   ```

### Railway/Render (Backend)

1. **Push to GitHub**
2. **Connect to Railway/Render**
3. **Set environment variables** from `.env.example`

---

## ✅ Deployment Checklist

- [ ] Environment variables configured (no defaults in prod)
- [ ] MongoDB connection verified
- [ ] Backend starts without errors
- [ ] Frontend connects to backend API
- [ ] Docker builds successfully
- [ ] Health check endpoint responds (`/health`)
- [ ] API endpoints tested with Postman collection
- [ ] CORS configured for target domain
- [ ] JWT secrets changed from defaults
- [ ] Groq API key configured
- [ ] File upload directory permissions OK
- [ ] Logs configured appropriately

---

## 📝 License

© 2024 Orbit World Travels. All rights reserved.

---

## 💬 Support

For issues and questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Postman collection for API examples
3. Check backend logs: `npm run dev` output
4. Check frontend console: Browser DevTools
