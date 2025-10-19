# Deployment Guide

This guide covers deploying the Universal Link Tracker Dashboard to various platforms.

## 🚀 Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications, offering the best performance and developer experience.

### Prerequisites

- Vercel account
- GitHub repository with the dashboard code

### Steps

1. **Prepare your repository**:

   ```bash
   git init
   git add .
   git commit -m "Initial dashboard implementation"
   git remote add origin https://github.com/your-username/universal-link-tracker-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `dashboard` (if dashboard is in subfolder)
     - **Build Command**: `npm run build` (auto-detected)
     - **Output Directory**: `.next` (auto-detected)

3. **Add environment variables**:

   - Go to Settings → Environment Variables
   - Add all variables from [.env.example](dashboard/.env.example):

   ```env
   DASHBOARD_PASSWORD_HASH=your-bcrypt-hashed-password
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   AWS_REGION=us-east-2
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   DYNAMODB_BRANDS_TABLE=universal-link-tracker-brands-production
   DYNAMODB_EVENTS_TABLE=universal-link-tracker-events-production
   DYNAMODB_LEGACY_TABLE=universal-link-tracker-production
   NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url
   NEXT_PUBLIC_APP_NAME=Universal Link Tracker Dashboard
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

4. **Deploy**:

   - Click "Deploy"
   - Wait for the build to complete
   - Vercel will provide a production URL

5. **Set custom domain** (optional):
   - Go to Settings → Domains
   - Add your domain (e.g., `dashboard.onlysignal.io`)
   - Follow DNS configuration instructions

### Alternative: Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   cd dashboard
   vercel --prod
   ```

3. **Configure environment variables**:
   ```bash
   # Add environment variables via CLI
   vercel env add DASHBOARD_PASSWORD_HASH production
   vercel env add JWT_SECRET production
   # ... add all required variables
   ```

## 🌐 Cloudflare Pages

### Prerequisites

- Cloudflare account
- GitHub repository

### Important Notes

- Cloudflare Pages requires the `@cloudflare/next-on-pages` adapter for Next.js
- Some Next.js features may have limitations on Cloudflare Pages
- Consider using Vercel or Docker deployment for full Next.js compatibility

### Steps

1. **Install Cloudflare adapter**:

   ```bash
   npm install --save-dev @cloudflare/next-on-pages
   ```

2. **Update next.config.ts**:

   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     // Remove or comment out standalone output for Cloudflare
     // output: "standalone",
   };
   ```

3. **Deploy via Cloudflare Dashboard**:

   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
   - Click "Create a project"
   - Connect to Git → Select your repository
   - Configure build settings:
     - **Framework preset**: Next.js
     - **Build command**: `npx @cloudflare/next-on-pages`
     - **Build output directory**: `.vercel/output/static`
     - **Root directory**: `dashboard` (if in subfolder)

4. **Add environment variables** in Settings → Environment variables

## 🐳 Docker

Docker deployment provides the most flexibility and portability. A [Dockerfile](dashboard/Dockerfile) is included in the project.

### Prerequisites

- Docker installed on your system
- `.env.local` file with required environment variables (see [.env.example](dashboard/.env.example))

### Build and Run

1. **Build the Docker image**:

   ```bash
   cd dashboard
   docker build -t link-tracker-dashboard .
   ```

2. **Run the container**:

   ```bash
   docker run -p 3000:3000 --env-file .env.local link-tracker-dashboard
   ```

3. **Or use docker-compose** (create `docker-compose.yml`):

   ```yaml
   version: "3.8"
   services:
     dashboard:
       build: .
       ports:
         - "3000:3000"
       env_file:
         - .env.local
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
         interval: 30s
         timeout: 3s
         retries: 3
         start_period: 5s
   ```

   Then run:

   ```bash
   docker-compose up -d
   ```

### Production Deployment

For production, use environment variables instead of `.env.local`:

```bash
docker run -d \
  -p 3000:3000 \
  -e DASHBOARD_PASSWORD_HASH="$2a$10$..." \
  -e JWT_SECRET="your-secret" \
  -e AWS_REGION="us-east-2" \
  -e AWS_ACCESS_KEY_ID="AKIA..." \
  -e AWS_SECRET_ACCESS_KEY="..." \
  -e DYNAMODB_BRANDS_TABLE="..." \
  -e DYNAMODB_EVENTS_TABLE="..." \
  -e DYNAMODB_LEGACY_TABLE="..." \
  -e NEXT_PUBLIC_API_GATEWAY_URL="https://..." \
  -e NEXT_PUBLIC_APP_NAME="..." \
  -e NEXT_PUBLIC_APP_URL="https://..." \
  --name dashboard \
  --restart unless-stopped \
  link-tracker-dashboard
```

## ☁️ AWS

### Using AWS Amplify

1. **Connect repository**:

   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect to your GitHub repository
   - If dashboard is in a subdirectory, configure the monorepo settings

2. **Configure build settings**:

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - node --version
           - npm --version
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - "**/*"
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   env:
     variables:
       NODE_VERSION: "18"
   ```

   > **Note**: If dashboard is in a subdirectory, update the `baseDirectory` and add `cd dashboard` before commands.

3. **Add environment variables**:
   - Go to App settings → Environment variables
   - Add all required variables from [.env.example](dashboard/.env.example)

### Using AWS ECS (Elastic Container Service)

Recommended for production Docker deployments.

1. **Push Docker image to ECR**:

   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name link-tracker-dashboard

   # Login to ECR
   aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-2.amazonaws.com

   # Build and tag
   docker build -t link-tracker-dashboard .
   docker tag link-tracker-dashboard:latest <account-id>.dkr.ecr.us-east-2.amazonaws.com/link-tracker-dashboard:latest

   # Push
   docker push <account-id>.dkr.ecr.us-east-2.amazonaws.com/link-tracker-dashboard:latest
   ```

2. **Create ECS task definition** with environment variables
3. **Deploy to ECS Fargate** or EC2 cluster

## 🔧 Environment Variables

All required environment variables are documented in [.env.example](dashboard/.env.example). Copy this file to `.env.local` and update with your values.

### Required Variables

| Variable                      | Description                       | Example                                    |
| ----------------------------- | --------------------------------- | ------------------------------------------ |
| `DASHBOARD_PASSWORD_HASH`     | Bcrypt hashed password            | `$2a$10$...`                               |
| `JWT_SECRET`                  | JWT signing secret (min 32 chars) | Generated with `openssl rand -base64 32`   |
| `AWS_REGION`                  | AWS region                        | `us-east-2`                                |
| `AWS_ACCESS_KEY_ID`           | AWS access key                    | `AKIA...`                                  |
| `AWS_SECRET_ACCESS_KEY`       | AWS secret key                    | `secret...`                                |
| `DYNAMODB_BRANDS_TABLE`       | Brands table name                 | `universal-link-tracker-brands-production` |
| `DYNAMODB_EVENTS_TABLE`       | Events table name                 | `universal-link-tracker-events-production` |
| `DYNAMODB_LEGACY_TABLE`       | Legacy table name                 | `universal-link-tracker-production`        |
| `NEXT_PUBLIC_API_GATEWAY_URL` | API Gateway URL                   | `https://api.example.com`                  |
| `NEXT_PUBLIC_APP_NAME`        | App name                          | `Universal Link Tracker Dashboard`         |
| `NEXT_PUBLIC_APP_URL`         | App URL                           | `https://dashboard.example.com`            |

### Setup Instructions

1. **Copy template**:

   ```bash
   cd dashboard
   cp .env.example .env.local
   ```

2. **Generate password hash**:

   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
   ```

3. **Generate JWT secret**:

   ```bash
   openssl rand -base64 32
   ```

4. **Update `.env.local`** with your actual values

> **Security Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## 🔍 Health Checks

### Health Check Endpoint

The dashboard includes a dedicated health check endpoint at `/api/health` that doesn't require authentication.

```bash
# Basic health check (200 = healthy, 503 = unhealthy)
curl -f https://your-dashboard.com/api/health

# Response example:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-15T10:30:00.000Z",
#   "uptime": 3600,
#   "environment": "production"
# }
```

### Authentication Test

```bash
curl -X POST https://your-dashboard.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'
```

### Load Balancer Configuration

For AWS Application Load Balancer, configure:

- **Health check path**: `/api/health`
- **Healthy threshold**: 2
- **Unhealthy threshold**: 3
- **Timeout**: 5 seconds
- **Interval**: 30 seconds
- **Success codes**: 200

## 📊 Monitoring

### Key Metrics to Monitor

- **Response Time**: < 2 seconds for page loads
- **Error Rate**: < 1% of requests
- **Uptime**: > 99.9%
- **Memory Usage**: Monitor for memory leaks
- **Database Connections**: Monitor DynamoDB throttling

### Logging

The application logs errors and important events. Monitor these in your deployment platform:

- Authentication failures
- API errors
- DynamoDB connection issues
- Build failures

## 🔒 Security Considerations

### Production Security

1. **Environment Variables**: Never commit `.env.local` to version control
2. **HTTPS**: Always use HTTPS in production
3. **JWT Secret**: Use a strong, random JWT secret (min 32 characters)
4. **Password**: Use a strong dashboard password
5. **AWS Credentials**: Use IAM roles with minimal required permissions
6. **CORS**: Configure CORS properly for your domain

### AWS IAM Permissions

Create an IAM user with minimal required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:*:table/universal-link-tracker-brands-production",
        "arn:aws:dynamodb:us-east-2:*:table/universal-link-tracker-events-production",
        "arn:aws:dynamodb:us-east-2:*:table/universal-link-tracker-production"
      ]
    }
  ]
}
```

> **Best Practice**: For ECS deployments, use IAM roles instead of access keys.

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check TypeScript errors

2. **Runtime Errors**:

   - Verify environment variables are set
   - Check AWS credentials and permissions
   - Verify DynamoDB table names

3. **Authentication Issues**:

   - Verify JWT_SECRET is set
   - Check password hash format
   - Verify cookie settings

4. **Database Connection Issues**:
   - Check AWS credentials
   - Verify table names and regions
   - Check IAM permissions

### Debug Mode

Set `NODE_ENV=development` to enable debug logging.

## 📈 Performance Optimization

### Build Optimization

1. **Enable compression** in your hosting platform
2. **Use CDN** for static assets
3. **Enable caching** for API responses
4. **Optimize images** and assets

### Runtime Optimization

1. **Connection pooling** for DynamoDB
2. **Query optimization** for large datasets
3. **Caching** for frequently accessed data
4. **Lazy loading** for dashboard components

## 🔄 CI/CD Pipeline

### GitHub Actions for Vercel

A complete GitHub Actions workflow is available at [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

**Manual setup:**

```yaml
name: Deploy Dashboard

on:
  push:
    branches: [main]
    paths: ["dashboard/**"]
  pull_request:
    branches: [main]
    paths: ["dashboard/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: dashboard/package-lock.json

      - name: Install dependencies
        working-directory: dashboard
        run: npm ci

      - name: Type check
        working-directory: dashboard
        run: npm run type-check

      - name: Lint
        working-directory: dashboard
        run: npm run lint

      - name: Build
        working-directory: dashboard
        run: npm run build
        env:
          NEXT_PUBLIC_API_GATEWAY_URL: ${{ secrets.NEXT_PUBLIC_API_GATEWAY_URL }}
          NEXT_PUBLIC_APP_NAME: "Universal Link Tracker Dashboard"
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: dashboard
          vercel-args: "--prod"
```

### Required GitHub Secrets

Add these secrets in your repository settings (Settings → Secrets and variables → Actions):

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `NEXT_PUBLIC_API_GATEWAY_URL`: Your API Gateway URL
- `NEXT_PUBLIC_APP_URL`: Your dashboard URL

### Docker CI/CD

For Docker deployments to ECR/ECS:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to ECR
        working-directory: dashboard
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: link-tracker-dashboard
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: dashboard-service
          cluster: production-cluster
          wait-for-service-stability: true
```

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Copy `.env.example` to `.env.local` and configure all variables
- [ ] Generate strong `DASHBOARD_PASSWORD_HASH`
- [ ] Generate secure `JWT_SECRET` (min 32 characters)
- [ ] Configure AWS credentials with minimal IAM permissions
- [ ] Verify DynamoDB table names and region
- [ ] Set up custom domain and SSL certificate
- [ ] Configure environment variables in deployment platform
- [ ] Test health check endpoint (`/api/health`)
- [ ] Test authentication with production password
- [ ] Verify AWS DynamoDB connectivity
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy for DynamoDB
- [ ] Review security headers and CORS settings
- [ ] Test deployment in staging environment first

## 🔄 Rollback Procedures

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Docker/ECS

```bash
# List previous task definitions
aws ecs list-task-definitions --family-prefix link-tracker-dashboard

# Update service to previous task definition
aws ecs update-service \
  --cluster production-cluster \
  --service dashboard-service \
  --task-definition link-tracker-dashboard:PREVIOUS_REVISION
```

---

This completes the deployment setup for the Universal Link Tracker Dashboard!
