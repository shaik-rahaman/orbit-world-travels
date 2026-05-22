# 📚 Frontend API Configuration - Documentation Index

## Quick Navigation

### 🚀 **Just Getting Started?**
→ Read: **[FRONTEND_QUICKSTART.md](FRONTEND_QUICKSTART.md)** (5 min read)
- TL;DR commands
- Configuration map
- Quick verification
- Common FAQ

### 💻 **Local Development?**
→ Just run: `npm run dev` and enjoy!
- Automatically uses `.env.local`
- No configuration needed
- Hot reload works

### ☁️ **Deploying to Azure?**
→ Read: **[AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)** (comprehensive guide)
- 4 deployment methods
- Step-by-step instructions
- GitHub Actions CI/CD
- Troubleshooting

### 🔧 **Technical Deep Dive?**
→ Read: **[API_CONFIGURATION.md](frontend/API_CONFIGURATION.md)** (detailed guide)
- Architecture overview
- How it works
- Usage patterns
- Security notes

### 📊 **Want the Big Picture?**
→ Read: **[FRONTEND_API_CONFIG_SUMMARY.md](FRONTEND_API_CONFIG_SUMMARY.md)** (implementation details)
- What was done
- Architecture overview
- Key features
- Verification checklist

### ✅ **Completed Implementation?**
→ Read: **[FRONTEND_API_IMPLEMENTATION_COMPLETE.md](FRONTEND_API_IMPLEMENTATION_COMPLETE.md)** (executive summary)
- What was done
- Status (READY FOR DEPLOYMENT ✓)
- Usage examples
- Next steps

---

## Documentation by Use Case

### 🏠 Local Development
| Task | Document | Time |
|------|----------|------|
| Start dev server | FRONTEND_QUICKSTART | 30s |
| Understand config | API_CONFIGURATION | 20 min |
| Debug API calls | API_CONFIGURATION | 10 min |

### ☁️ Azure Deployment
| Task | Document | Time |
|------|----------|------|
| Choose deployment method | AZURE_DEPLOYMENT | 5 min |
| Deploy to Web App | AZURE_DEPLOYMENT | 15 min |
| Deploy with Docker | AZURE_DEPLOYMENT | 15 min |
| Setup CI/CD | AZURE_DEPLOYMENT | 20 min |
| Verify deployment | AZURE_DEPLOYMENT | 10 min |

### 🐳 Docker Deployment
| Task | Document | Time |
|------|----------|------|
| Build for local | FRONTEND_QUICKSTART | 5 min |
| Build for Azure | FRONTEND_QUICKSTART | 5 min |
| Push to registry | AZURE_DEPLOYMENT | 10 min |
| Deploy container | AZURE_DEPLOYMENT | 10 min |

### 👨‍💻 Development Team
| Task | Document | Time |
|------|----------|------|
| Get started | FRONTEND_QUICKSTART | 5 min |
| Understand changes | FRONTEND_API_CONFIG_SUMMARY | 10 min |
| Deep dive | API_CONFIGURATION | 30 min |

### 🏢 DevOps/Cloud Team
| Task | Document | Time |
|------|----------|------|
| Overview | FRONTEND_API_IMPLEMENTATION_COMPLETE | 10 min |
| Deployment | AZURE_DEPLOYMENT | 45 min |
| CI/CD setup | AZURE_DEPLOYMENT | 30 min |
| Monitoring | AZURE_DEPLOYMENT | 20 min |

---

## File Structure

```
Orbit World Travels/
├── frontend/
│   ├── config/
│   │   └── api.ts ..................... Centralized API config (NEW)
│   ├── constants/
│   │   └── index.ts ................... Re-exports API_BASE_URL
│   ├── services/
│   │   └── apiClient.ts ............... Axios client (unchanged)
│   ├── .env.local ..................... Local dev config (UPDATED)
│   ├── .env.production ................ Production config (UPDATED)
│   ├── .env.example ................... Template (UPDATED)
│   ├── Dockerfile ..................... Docker config (UPDATED)
│   └── API_CONFIGURATION.md ........... Config guide (NEW)
│
├── AZURE_DEPLOYMENT.md ................ Azure guide (NEW)
├── FRONTEND_API_CONFIG_SUMMARY.md .... Implementation (NEW)
├── FRONTEND_QUICKSTART.md ............ Quick ref (NEW)
└── FRONTEND_API_IMPLEMENTATION_COMPLETE.md ... Status (NEW)
```

---

## Key Concepts

### Environment Variables
- `NEXT_PUBLIC_API_BASE_URL` - API base URL (local or Azure)
- `NEXT_PUBLIC_ENVIRONMENT` - Current environment (development/production)

### Configuration Levels
1. **System Default** - `http://localhost:3008` (fallback)
2. **Environment Variable** - From .env files or system
3. **Build-Time** - Embedded in JavaScript at build time
4. **Runtime** - Used as-is from build

### Deployment Modes
- **Local Dev** - `npm run dev` (uses .env.local)
- **Local Build** - `npm run build && npm start` (uses .env.local)
- **Production** - `npm run build` (uses env var or .env.production)
- **Docker Local** - `docker build .` (uses Dockerfile default)
- **Docker Azure** - `docker build --build-arg ...` (custom URL)

---

## Common Commands

### Local Development
```bash
cd frontend
npm run dev                    # Start dev server
npm run build                  # Build locally
npm start                      # Run local build
```

### Production Build
```bash
export NEXT_PUBLIC_API_BASE_URL=https://...azure.../api/orbit-world
npm run build                  # Build for production
npm start                      # Run production build
```

### Docker
```bash
# Local
docker build -t orbit-frontend .
docker run -p 8008:8008 orbit-frontend

# Azure
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://... -t orbit-frontend:azure .
docker run -p 8008:8008 orbit-frontend:azure
```

### Verify Configuration
```bash
# Check environment variable
echo $NEXT_PUBLIC_API_BASE_URL

# Check in browser console (at http://localhost:8008)
# Look for: [API Config] Base URL: ...
```

---

## Decision Tree

### How do I run locally?
→ `npm run dev` (that's it!)

### How do I deploy to Azure?
→ See [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)

### How do I use Docker?
→ See [FRONTEND_QUICKSTART.md](FRONTEND_QUICKSTART.md)

### How does configuration work?
→ See [API_CONFIGURATION.md](frontend/API_CONFIGURATION.md)

### What changed in my codebase?
→ See [FRONTEND_API_CONFIG_SUMMARY.md](FRONTEND_API_CONFIG_SUMMARY.md)

### Is it ready for production?
→ Yes! See [FRONTEND_API_IMPLEMENTATION_COMPLETE.md](FRONTEND_API_IMPLEMENTATION_COMPLETE.md)

---

## Implementation Status

| Component | Status | Details |
|-----------|--------|---------|
| Configuration | ✅ Complete | Centralized in config/api.ts |
| Environment Files | ✅ Complete | .env.local and .env.production updated |
| Docker Support | ✅ Complete | Build args configured |
| Documentation | ✅ Complete | 5 comprehensive guides |
| Backward Compatibility | ✅ Complete | No breaking changes |
| Build Verification | ✅ Complete | Builds successfully |
| Deployment Ready | ✅ Complete | Ready for Azure |

---

## Support Resources

### For Local Development Issues
1. Check [FRONTEND_QUICKSTART.md](FRONTEND_QUICKSTART.md)
2. Review [API_CONFIGURATION.md](frontend/API_CONFIGURATION.md) troubleshooting section
3. Check browser console for `[API Config]` logs

### For Deployment Issues
1. Review [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md) troubleshooting section
2. Verify environment variables are set
3. Check backend is running and accessible
4. Review build logs for errors

### For Architecture Questions
1. Read [FRONTEND_API_CONFIG_SUMMARY.md](FRONTEND_API_CONFIG_SUMMARY.md)
2. Review diagrams in [API_CONFIGURATION.md](frontend/API_CONFIGURATION.md)
3. Check config/api.ts source code comments

---

## Quick Facts

- ✅ **Zero Breaking Changes** - All existing code works
- ✅ **Environment-Based** - No hardcoded URLs
- ✅ **Local Dev Ready** - Just `npm run dev`
- ✅ **Azure Ready** - Environment variable + build
- ✅ **Docker Ready** - Build arguments supported
- ✅ **Well Documented** - 5 guides + inline comments
- ✅ **Production Ready** - All requirements met

---

## Version Info

- **Created:** May 21, 2026
- **Framework:** Next.js 16.2.4
- **Configuration Method:** Environment Variables (NEXT_PUBLIC_)
- **Deployment Target:** Azure Web App / Container Registry
- **Local Backend:** http://localhost:3008
- **Azure Backend:** https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net

---

## Next Steps

1. **Read** - Choose appropriate guide based on your role
2. **Understand** - Review architecture and configuration flow
3. **Test** - Run `npm run dev` or build locally
4. **Deploy** - Follow Azure deployment guide for cloud deployment
5. **Monitor** - Check logs and API configuration in production

---

**🚀 Happy Deploying! The Orbit World Travels application is ready for the cloud!**
