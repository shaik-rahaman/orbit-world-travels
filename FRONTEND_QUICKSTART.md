# Quick Start: Frontend API Configuration

## 🚀 TL;DR - Get Started in 30 Seconds

### Local Development (Works Right Now!)
```bash
cd frontend
npm run dev  # Opens http://localhost:8008, connects to http://localhost:3008
```

### Production Build for Azure
```bash
cd frontend
export NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world
npm run build
npm start  # Ready to deploy!
```

### Docker Local
```bash
docker build -t orbit-frontend .
docker run -p 8008:8008 orbit-frontend
```

### Docker Azure
```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world -t orbit-frontend:azure .
docker run -p 8008:8008 orbit-frontend:azure
```

---

## 📋 Configuration Map

| Scenario | What to Do | Result |
|----------|-----------|--------|
| **Local Dev** | Just `npm run dev` | Uses `.env.local` → localhost |
| **Local Build** | `npm run build` | Uses `.env.local` → localhost |
| **Azure Build** | Set `NEXT_PUBLIC_API_BASE_URL=https://...` then `npm run build` | Uses Azure URL → embedded in build |
| **Docker Local** | `docker build .` | Uses Dockerfile default → localhost |
| **Docker Azure** | `docker build --build-arg NEXT_PUBLIC_API_BASE_URL=...` | Uses ARG → Azure |

---

## 🔍 How to Verify Configuration

### Check Environment Variable
```bash
echo $NEXT_PUBLIC_API_BASE_URL
```

### Check Built App (in browser console)
```javascript
// Open http://localhost:8008 and check console
// Look for: [API Config] Base URL: http://localhost:3008/api/orbit-world
```

### Check Docker Image
```bash
docker run --rm --entrypoint env <image-name> | grep NEXT_PUBLIC_API_BASE_URL
```

---

## 🎯 Architecture in One Diagram

```
Environment Variable
(NEXT_PUBLIC_API_BASE_URL)
        ↓
   config/api.ts
        ↓
  constants/index.ts
        ↓
  apiClient.ts (Axios)
        ↓
   All API Calls
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `frontend/config/api.ts` | **Centralized config** - reads env vars |
| `frontend/.env.local` | **Local dev** - localhost URL |
| `frontend/.env.production` | **Production** - Azure URL |
| `frontend/Dockerfile` | **Docker** - supports build args |

---

## ⚡ Deployment Commands

### Build for Azure
```bash
cd frontend
export NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world
npm run build
# Now ready to deploy to Azure Web App
```

### Deploy to Azure (Zip)
```bash
cd frontend
zip -r ../frontend-build.zip .next public package*.json next.config.ts
az webapp deployment source config-zip \
  --resource-group orbit-world-rg \
  --name orbit-world-frontend \
  --src ../frontend-build.zip
```

### Deploy to Azure (Container)
```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world -t <image> .
docker push <image-registry>
# Deploy using Azure Container Registry
```

---

## ❓ FAQ

**Q: Do I need to modify anything for local development?**  
A: No! Just `npm run dev` and it works.

**Q: Does the API URL get baked into the build?**  
A: Yes! The environment variable value is compiled into the JavaScript at build time.

**Q: Can I change the API URL after building?**  
A: No. Rebuild with a different `NEXT_PUBLIC_API_BASE_URL` value.

**Q: What if the environment variable is not set?**  
A: Falls back to `http://localhost:3008/api/orbit-world`

**Q: How does Docker work?**  
A: Use build arguments: `docker build --build-arg NEXT_PUBLIC_API_BASE_URL=...`

**Q: Are there any hardcoded URLs in the code?**  
A: Only the fallback in `config/api.ts` - everything else uses environment variables.

**Q: Can I use this with CI/CD?**  
A: Yes! Set the environment variable in your CI/CD pipeline before building.

---

## 🔗 Azure URLs

**Frontend:**  
```
https://orbit-world-frontend.azurewebsites.net
```

**Backend:**  
```
https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world
```

---

## 📚 Full Documentation

- **API Configuration Details:** See `frontend/API_CONFIGURATION.md`
- **Azure Deployment Guide:** See `AZURE_DEPLOYMENT.md`
- **Implementation Summary:** See `FRONTEND_API_CONFIG_SUMMARY.md`

---

## ✅ Everything Verified

- ✓ Local development works
- ✓ Build succeeds
- ✓ No hardcoded URLs
- ✓ Docker support
- ✓ Azure deployment ready
- ✓ Zero breaking changes
