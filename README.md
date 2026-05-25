# 🚀 Orbit World Travels

Production-grade AI-powered Travel Operations Management Platform built to streamline bookings, invoicing, analytics, and customer operations for travel agencies.

Combines enterprise workflow management with AI-assisted automation, conversational AI, and intelligent reporting capabilities.

---

# 🌐 Live Demo

Live Application:
https://orbitworld.ddns.net

Demo Credentials:
Email: [demo@orbitworld.com](mailto:demo@orbitworld.com)
Password: Demo123!

Note:
Demo account has restricted read-only access intended for recruiter and portfolio evaluation purposes.

---

# 🔥 Highlights

* 🧾 End-to-end invoice management with profitability and margin tracking
* ✈️ Multi-module travel operations platform (Visa, Flight, Hotel, Insurance, CRM)
* 🤖 AI-powered chatbot with semantic + keyword search
* 📄 LLM-powered invoice and document processing workflows
* 📊 Real-time analytics dashboards and operational reporting
* 🔐 JWT authentication with Role-Based Access Control (RBAC)
* ☁️ Production deployment using Azure VM, Nginx, PM2, and HTTPS

---

# 🎯 Use Case

Designed for travel agencies and operations teams to:

* Manage complete booking lifecycle across services
* Track operational profitability in real time
* Automate invoice creation and document workflows
* Query operational data using natural language
* Centralize travel operations into a unified enterprise platform

This platform represents a real-world internal SaaS-style operational system.

---

# 📸 Screenshots

## Dashboard

Real-time overview of bookings, revenue, and operational metrics.

![Dashboard](./screenshots/dashboard.png)

---

## Flight Management

Manage PNRs, passenger details, ticket uploads, and travel workflows.

![Flights](./screenshots/flights.png)

---

## AI Chat Assistant

AI-powered conversational assistant for querying operational data using natural language.

![Chat](./screenshots/chat.png)

---

# 🧠 AI Capabilities

* LLM-powered invoice and document processing
* Conversational AI assistant
* Hybrid retrieval architecture (Vector + BM25 search)
* Semantic operational querying
* AI-assisted workflow automation
* Natural language search over operational data
* Intelligent document understanding workflows

---

# 🏗️ Architecture

Frontend:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Zustand

Backend:

* Node.js
* Express
* TypeScript
* MongoDB
* Mongoose

AI Layer:

* Groq LLM (LLaMA 3)
* Semantic retrieval
* Hybrid search (Vector + BM25)
* Query generation workflows

Infrastructure:

* Azure VM
* Nginx reverse proxy
* PM2 process management
* HTTPS / Let's Encrypt
* MongoDB Atlas

---

# 🛠️ Tech Stack

| Layer          | Technologies                                          |
| -------------- | ----------------------------------------------------- |
| Frontend       | Next.js, React, TypeScript, Tailwind CSS, Zustand     |
| Backend        | Node.js, Express, TypeScript, MongoDB, Mongoose       |
| Authentication | JWT Authentication, RBAC                              |
| AI/ML          | Groq LLM (LLaMA 3), Semantic Search, Vector Retrieval |
| DevOps         | Docker, PM2, Nginx, Azure VM                          |
| Database       | MongoDB Atlas                                         |

---

# 🚀 Quick Start

## Prerequisites

* Node.js (v18+)
* MongoDB
* npm (v8+)
* Groq API Key

---

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Access

Frontend:
http://localhost:8008

Backend:
http://localhost:3008

Health Check:
http://localhost:3008/health

---

# 🔒 Environment Variables

## Backend

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=3008
NODE_ENV=development
```

---

## Frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3008/api/orbit-world
NEXT_PUBLIC_ENVIRONMENT=development
```

---

# 🐳 Docker Deployment

```bash
docker-compose up -d
```

---

# ☁️ Production Infrastructure

* Azure VM deployment
* Nginx reverse proxy
* PM2 process management
* HTTPS with Let's Encrypt
* MongoDB Atlas
* Environment-based configuration
* Production-ready deployment workflows

---

# ⚙️ API Configuration

Supports:

* ✅ Local Development
* ✅ Production Deployment
* ✅ Docker Deployment
* ✅ Environment-based API configuration
* ✅ CI/CD integration workflows

---

# 🔐 Security

* Environment-variable-based secret management
* JWT authentication
* Role-Based Access Control (RBAC)
* Restricted demo access
* Secure deployment configuration
* Protected API routes
* HTTPS-enabled production deployment

---

# 📂 Project Structure

```bash
orbit-world-travels/
├── backend/
├── frontend/
├── screenshots/
├── docker-compose.yml
├── README.md
```

---

# 🚢 Cloud Readiness

Supports deployment to:

* Azure VM / App Services
* AWS ECS / Fargate
* Railway
* Render
* Docker-based infrastructure
* Vercel (Frontend)

---

# ✅ Deployment Checklist

* ✅ Backend environment variables configured
* ✅ Frontend environment variables configured
* ✅ MongoDB Atlas connectivity
* ✅ JWT authentication configured
* ✅ APIs tested and verified
* ✅ Production build validated
* ✅ Docker compatibility verified
* ✅ Secrets secured
* ✅ HTTPS enabled

---

# 👨‍💻 Author

Shaik Rahaman

LinkedIn:
https://www.linkedin.com/in/shaikrahaman

GitHub:
https://github.com/shaik-rahaman

---

# 📝 License

© 2026 Orbit World Travels
