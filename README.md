# 🚀 Orbit World Travels

A production-grade **Travel Operations Management Platform** built to streamline bookings, invoicing, and customer management for travel agencies — enhanced with AI-powered automation.

---

## 🔥 Highlights

* 🧾 End-to-end invoice management with margin tracking
* ✈️ Multi-module system (Visa, Flight, Hotel, Insurance, CRM)
* 🤖 AI chatbot with semantic + keyword search
* 📄 Document-based invoice generation (LLM-powered)
* 📊 Real-time analytics and reporting

---

## 🎯 Use Case

Designed for travel agencies to:

* Manage complete booking lifecycle across services
* Track profitability and margins in real time
* Automate invoice creation from documents
* Query operational data using natural language

This platform represents a **real-world internal SaaS system** used by travel operators.

---

## 📸 Screenshots

### Dashboard

Real-time overview of bookings, revenue, and operations.
![Dashboard](./screenshots/dashboard.png)

### Flight Management

Track PNR, passengers, and ticket uploads.
![Flights](./screenshots/flights.png)

### AI Chat Assistant

Query travel data using natural language.
![Chat](./screenshots/chat.png)

---

## 🧠 Why This Project Stands Out

* Built as a **real-world SaaS product**, not a demo
* Combines **AI + traditional CRUD systems**
* Implements **hybrid search (Vector + BM25)**
* Designed with **scalability and modular architecture**

---

## 🛠️ Tech Stack

| Layer              | Technologies                                              |
| ------------------ | --------------------------------------------------------- |
| **Frontend**       | Next.js, React, TypeScript, Tailwind CSS, Zustand         |
| **Backend**        | Node.js, Express, TypeScript, MongoDB, Mongoose           |
| **Authentication** | JWT-based, Role-Based Access Control (RBAC)               |
| **AI/ML**          | Groq LLM (LLaMA 3), Document Processing, Query Generation |
| **DevOps**         | Docker, Docker Compose                                    |

---

## 🚀 Quick Start

### Prerequisites

* Node.js (v18+)
* MongoDB (local or cloud)
* npm (v8+)
* Groq API Key

---

### Local Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### Access

* Frontend: http://localhost:8008
* Backend: http://localhost:3008
* Health: http://localhost:3008/health

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

---

## 📂 Project Structure

```
orbit-world-travels/
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
```

---

## 🔒 Environment Variables

Never commit real values.

Example:

```env
GROQ_API_KEY=your_api_key_here
JWT_SECRET=your_secret_here
MONGODB_URI=your_db_url_here
```

---

## 🚢 Cloud Readiness

* AWS (ECS / Fargate)
* Vercel (Frontend)
* Railway / Render (Backend)

---

## ✅ Deployment Checklist

* Environment variables configured
* Backend and frontend connected
* APIs tested
* Docker working
* Secrets secured

---

## 👨‍💻 Author

Shaik Rahaman

---

## 📝 License

© 2024 Orbit World Travels
