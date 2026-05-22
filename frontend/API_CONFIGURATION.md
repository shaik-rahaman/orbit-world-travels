# Frontend API Configuration Guide

## Overview

The Orbit World Travels frontend uses environment-based API configuration to support both local development and cloud deployments (Azure).

**Current Setup:**
- **Local Development:** `http://localhost:3008/api/orbit-world`
- **Production (Azure):** `https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world`

## Architecture

### Configuration Files

#### 1. **`frontend/config/api.ts`** (Centralized Config)
This is the single source of truth for API configuration.

```typescript
// Automatically loads from environment variables
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3008/api/orbit-world';
```

**Features:**
- Environment-based URL resolution
- Fallback to localhost for safety
- Development logging (console output)
- Endpoint definitions
- Retry configuration
- Request timeout settings

#### 2. **`frontend/constants/index.ts`** (Re-export)
Re-exports the API base URL from config for backward compatibility:

```typescript
import { API_BASE_URL } from '@/config/api';
export { API_BASE_URL };
```

#### 3. **`frontend/services/apiClient.ts`** (Axios Client)
Uses the centralized config to initialize Axios:

```typescript
import { API_BASE_URL } from '@/constants';

const instance = axios.create({
  baseURL: API_BASE_URL,
  // ... other config
});
```

### Environment Variables

#### Local Development (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3008/api/orbit-world
NEXT_PUBLIC_ENVIRONMENT=development
```

#### Production (`.env.production`)
```env
NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world
NEXT_PUBLIC_ENVIRONMENT=production
```

#### Docker Build Arguments
When building Docker images, pass the API URL as a build argument:

```bash
# Local Development Build
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:3008/api/orbit-world .

# Production (Azure) Build
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world .
```

## Usage Patterns

### Pattern 1: Local Development (No Changes Needed)
```bash
cd frontend
npm install
npm run dev  # Uses .env.local automatically
```

**Result:**
- All API calls go to `http://localhost:3008/api/orbit-world`
- No configuration needed
- Hot reload works

### Pattern 2: Production Build (Automatic URL Selection)
```bash
# Build for production with Azure URL
NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world npm run build
```

**Result:**
- All API calls go to Azure backend
- URL is baked into the build
- No environment variables needed at runtime

### Pattern 3: Docker Deployment (Local)
```bash
# Build and run locally
docker build -t orbit-world-frontend .
docker run -p 8008:8008 orbit-world-frontend
```

**Result:**
- Uses default localhost URL from Dockerfile
- Works with local backend

### Pattern 4: Docker Deployment (Azure)
```bash
# Build with Azure URL
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world \
  -t orbit-world-frontend:azure .

docker run -p 8008:8008 orbit-world-frontend:azure
```

**Result:**
- Uses Azure backend URL
- All API calls routed to cloud

## How It Works

### Environment Variable Resolution (Next.js)

Next.js automatically:
1. Reads environment variables at **build time**
2. Injects them into the client-side code
3. Makes them available via `process.env.NEXT_PUBLIC_*`

**Key Point:** The `NEXT_PUBLIC_` prefix is required for client-side access.

### Flow Diagram

```
Local Development:
.env.local → npm run dev → API Client → localhost:3008

Production Build:
.env.production → npm run build → Compiled JS with hardcoded URL → Azure API

Docker (Local):
Dockerfile ARG (default) → Build → Container → localhost:3008

Docker (Azure):
Dockerfile ARG (override) → Build → Container → Azure API
```

## Verification

### Check Local Development Setup
```bash
cd frontend
npm run dev
# Open browser console (F12)
# Look for: [API Config] Base URL: http://localhost:3008/api/orbit-world
```

### Check Production Build
```bash
NEXT_PUBLIC_API_BASE_URL=https://... npm run build
# Inspect: .next/static/chunks/*.js (search for Azure URL)
```

### Check Docker Image
```bash
# After building Docker image
docker run --rm orbit-world-frontend env | grep NEXT_PUBLIC_API_BASE_URL
```

## API Endpoints

All endpoints are automatically prefixed with the base URL:

| Endpoint | Full URL (Local) |
|----------|-----------------|
| `/auth/login` | `http://localhost:3008/api/orbit-world/auth/login` |
| `/visa` | `http://localhost:3008/api/orbit-world/visa` |
| `/flight` | `http://localhost:3008/api/orbit-world/flight` |
| `/hotel` | `http://localhost:3008/api/orbit-world/hotel` |
| `/insurance` | `http://localhost:3008/api/orbit-world/insurance` |
| `/invoices` | `http://localhost:3008/api/orbit-world/invoices` |
| `/ai/chat` | `http://localhost:3008/api/orbit-world/ai/chat` |

## Troubleshooting

### Issue: API calls going to wrong URL
**Solution:** Check environment variable is set before build:
```bash
echo $NEXT_PUBLIC_API_BASE_URL
npm run build  # Rebuild after changing env var
```

### Issue: 404 errors on Azure deployment
**Solution:** Verify Azure backend URL:
1. Check `.env.production` has correct URL
2. Verify Azure service is running
3. Check CORS configuration on backend

### Issue: CORS errors
**Solution:** Ensure backend has correct CORS origins:
```bash
# Backend .env
CORS_ORIGINS=http://localhost:8008,https://yourazureappurl.com
```

### Issue: Localhost not working
**Solution:** 
1. Start backend: `cd backend && npm run dev`
2. Verify: `curl http://localhost:3008/health`
3. Rebuild frontend: `cd frontend && npm run build && npm run dev`

## Security Notes

⚠️ **Important:**
- The API URL is **public** in built code (it's in JavaScript)
- Never put secrets in `NEXT_PUBLIC_*` variables
- Use secure authentication for sensitive operations
- Backend should validate all requests

## Files Modified

| File | Changes |
|------|---------|
| `frontend/config/api.ts` | NEW - Centralized config |
| `frontend/constants/index.ts` | Updated to import from config |
| `frontend/.env.local` | Updated with comments |
| `frontend/.env.production` | Updated with Azure URL |
| `frontend/.env.example` | Updated with documentation |
| `frontend/Dockerfile` | Updated to copy config and support build args |

## Support

For issues or questions about the API configuration:
1. Check the console logs: `[API Config]` prefix
2. Verify environment variables: `echo $NEXT_PUBLIC_API_BASE_URL`
3. Review configuration: `frontend/config/api.ts`
4. Test backend health: `curl http://localhost:3008/health`
