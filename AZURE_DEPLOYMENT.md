# Azure Deployment Guide

## Overview
This guide explains how to deploy the Orbit World Travels frontend to Azure Web App with proper API configuration.

## Prerequisites
- Azure account with Web App service
- Docker (for containerized deployment)
- Azure CLI (`az` command)
- Git for version control

## Deployment Methods

### Method 1: Direct Next.js Deployment to Azure App Service

#### Step 1: Prepare Production Build
```bash
cd frontend

# Set production environment variable
export NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world

# Build for production
npm run build

# Verify build (should show .next directory)
ls -la .next
```

#### Step 2: Create Azure App Service
```bash
# Using Azure CLI
az group create --name orbit-world-rg --location southindia

az appservice plan create \
  --name orbit-world-plan \
  --resource-group orbit-world-rg \
  --sku B1 --is-linux

az webapp create \
  --resource-group orbit-world-rg \
  --plan orbit-world-plan \
  --name orbit-world-frontend \
  --runtime "NODE:18-lts"
```

#### Step 3: Configure App Settings
```bash
az webapp config appsettings set \
  --resource-group orbit-world-rg \
  --name orbit-world-frontend \
  --settings \
    NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world \
    NODE_ENV=production
```

#### Step 4: Deploy
```bash
# Method A: Using zip deployment
cd frontend
zip -r ../frontend-build.zip .next public package*.json next.config.ts

az webapp deployment source config-zip \
  --resource-group orbit-world-rg \
  --name orbit-world-frontend \
  --src ../frontend-build.zip

# Method B: Using Git (recommended)
cd frontend
git init
git add .
git commit -m "Frontend deployment"

az webapp up \
  --name orbit-world-frontend \
  --resource-group orbit-world-rg \
  --runtime "NODE:18-lts"
```

### Method 2: Docker Container Deployment

#### Step 1: Build Docker Image
```bash
cd frontend

# Build with Azure API URL
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world \
  --build-arg NEXT_PUBLIC_ENVIRONMENT=production \
  -t orbit-world-frontend:latest .

# Tag for Azure Container Registry
docker tag orbit-world-frontend:latest \
  orbitworldacr.azurecr.io/orbit-world-frontend:latest
```

#### Step 2: Push to Azure Container Registry
```bash
# Login to ACR
az acr login --name orbitworldacr

# Push image
docker push orbitworldacr.azurecr.io/orbit-world-frontend:latest
```

#### Step 3: Create Web App from Container
```bash
az appservice plan create \
  --name orbit-world-plan \
  --resource-group orbit-world-rg \
  --sku B1 --is-linux

az webapp create \
  --resource-group orbit-world-rg \
  --plan orbit-world-plan \
  --name orbit-world-frontend \
  --deployment-container-image-name orbitworldacr.azurecr.io/orbit-world-frontend:latest

# Configure container image
az webapp config container set \
  --name orbit-world-frontend \
  --resource-group orbit-world-rg \
  --docker-custom-image-name orbitworldacr.azurecr.io/orbit-world-frontend:latest \
  --docker-registry-server-url https://orbitworldacr.azurecr.io \
  --docker-registry-server-username <ACR_USERNAME> \
  --docker-registry-server-password <ACR_PASSWORD>
```

#### Step 4: Configure App Settings
```bash
az webapp config appsettings set \
  --resource-group orbit-world-rg \
  --name orbit-world-frontend \
  --settings \
    WEBSITES_PORT=8008 \
    NODE_ENV=production
```

### Method 3: GitHub Actions Deployment (Recommended for CI/CD)

#### Step 1: Create GitHub Actions Workflow
Create `.github/workflows/deploy-to-azure.yml`:

```yaml
name: Deploy Frontend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

env:
  REGISTRY: orbitworldacr.azurecr.io
  IMAGE_NAME: orbit-world-frontend
  AZURE_RESOURCE_GROUP: orbit-world-rg
  AZURE_APP_NAME: orbit-world-frontend

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world \
            --build-arg NEXT_PUBLIC_ENVIRONMENT=production \
            -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest \
            ./frontend
      
      - name: Login to Azure Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.AZURE_REGISTRY_USERNAME }}
          password: ${{ secrets.AZURE_REGISTRY_PASSWORD }}
      
      - name: Push image to ACR
        run: |
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ env.AZURE_APP_NAME }}
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

#### Step 2: Add GitHub Secrets
In GitHub repository settings, add:
- `AZURE_REGISTRY_USERNAME`: ACR username
- `AZURE_REGISTRY_PASSWORD`: ACR password

### Method 4: Azure Container Instances (Quick Testing)

```bash
# Create and run container
az container create \
  --resource-group orbit-world-rg \
  --name orbit-world-frontend-aci \
  --image orbitworldacr.azurecr.io/orbit-world-frontend:latest \
  --cpu 1 --memory 1.5 \
  --registry-login-server orbitworldacr.azurecr.io \
  --registry-username <ACR_USERNAME> \
  --registry-password <ACR_PASSWORD> \
  --dns-name-label orbit-world-frontend \
  --ports 8008 \
  --environment-variables \
    NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world

# Get public IP
az container show \
  --resource-group orbit-world-rg \
  --name orbit-world-frontend-aci \
  --query ipAddress.fqdn
```

## Verification

### Test Local Build
```bash
cd frontend
NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world npm run build
npm start

# Should be accessible at http://localhost:3000
# API calls should go to Azure
```

### Test Docker Build
```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/api/orbit-world \
  -t test-frontend .

docker run -p 8008:8008 test-frontend

# Should be accessible at http://localhost:8008
# Check logs: docker logs <container-id>
```

### Verify API Configuration on Azure
1. Open Azure Web App URL: `https://orbit-world-frontend.azurewebsites.net`
2. Open browser DevTools (F12)
3. Check Console for: `[API Config] Base URL: https://...azure...`
4. Open Network tab and check API calls to ensure they go to Azure

### Health Check
```bash
curl https://orbit-world-frontend.azurewebsites.net

# Should return NextJS app HTML
# Check for any 502/503 errors indicating connection issues
```

## Environment-Specific URLs

| Environment | Frontend URL | Backend URL |
|------------|------------|------------|
| **Local Development** | http://localhost:8008 | http://localhost:3008 |
| **Azure Production** | https://orbit-world-frontend.azurewebsites.net | https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net |

## Troubleshooting Azure Deployment

### Issue: Application won't start
```bash
# Check logs
az webapp log tail --name orbit-world-frontend --resource-group orbit-world-rg

# Should see: Server ready on port 8008 or similar
```

### Issue: 502 Bad Gateway
1. Verify app is listening on port 8008 (see Dockerfile EXPOSE)
2. Check WEBSITES_PORT environment variable is set
3. Wait 2-3 minutes for app to fully start

### Issue: API calls failing (404/500)
1. Verify Azure backend is running
2. Check CORS settings on backend
3. Verify NEXT_PUBLIC_API_BASE_URL environment variable

### Issue: Cannot connect to backend
```bash
# From Azure app console, test connectivity:
curl https://orbit-world-backend-eyd5b5egezgqgjep.southindia-01.azurewebsites.net/health

# Should return JSON health check response
```

## Rollback

```bash
# If deployment fails, rollback to previous version
az webapp deployment slot swap \
  --resource-group orbit-world-rg \
  --name orbit-world-frontend \
  --slot staging
```

## Monitoring

### Enable Application Insights
```bash
az monitor app-insights component create \
  --app orbit-world-insights \
  --location southindia \
  --resource-group orbit-world-rg

# Link to Web App
az webapp config appsettings set \
  --name orbit-world-frontend \
  --resource-group orbit-world-rg \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY=<KEY>
```

### View Application Logs
```bash
az webapp log config \
  --name orbit-world-frontend \
  --resource-group orbit-world-rg \
  --web-server-logging filesystem

az webapp log tail \
  --name orbit-world-frontend \
  --resource-group orbit-world-rg
```

## Clean Up

```bash
# Delete resource group (deletes all resources)
az group delete --name orbit-world-rg --yes
```
