# CI/CD Pipeline & Vercel Deployment Guide

This guide provides step-by-step instructions for setting up the CI/CD pipeline and deploying the Percent MVP application to Vercel.

## Project Overview

This is a full-stack TypeScript application with:
- **Frontend**: React with Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel

## Prerequisites

1. **Node.js** (version 18+)
2. **npm** package manager
3. **Vercel account**
4. **GitHub account**
5. **PostgreSQL database** (for production)

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hemantsharma64/percent_mvp.git
   cd percent_mvp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run database migrations**:
   ```bash
   npm run db:push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## CI/CD Pipeline

The GitHub Actions pipeline is configured in `.github/workflows/ci.yml` and includes:

### Pipeline Jobs

1. **lint-and-test**: 
   - Installs dependencies
   - Runs TypeScript type checking
   - Builds the application
   - Uploads build artifacts

2. **deploy**:
   - Runs only on pushes to `main` branch
   - Builds and deploys to Vercel production

### Pipeline Triggers

- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop` branches

## Vercel Deployment Setup

### Step 1: Create Vercel Project

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

### Step 2: Configure Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:

   | Variable Name | Value | Environment |
   |---------------|--------|-------------|
   | `DATABASE_URL` | Your PostgreSQL connection string | Production |
   | `OPENAI_API_KEY` | Your OpenAI API key | Production |
   | `NODE_ENV` | production | Production |

### Step 3: GitHub Secrets Setup

For automated deployment via GitHub Actions, add these secrets to your GitHub repository:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

   | Secret Name | How to Get |
   |-------------|------------|
   | `VERCEL_TOKEN` | Go to Vercel → Settings → Tokens → Create |
   | `VERCEL_ORG_ID` | Run `vercel` in project root and check `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | Run `vercel` in project root and check `.vercel/project.json` |

### Step 4: Manual Deployment (First Time)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## Build Process

The build process consists of:

1. **Frontend build**: Vite builds React app to `dist/public/`
2. **Backend build**: ESBuild bundles server code to `dist/index.js`

### Build Commands

- **Development**: `npm run dev`
- **Production build**: `npm run build`
- **Type checking**: `npm run check`
- **Start production**: `npm start`

## Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions  │───▶│     Vercel      │
│                 │    │                  │    │                 │
│  - Source Code  │    │  - Build & Test  │    │  - Static Files │
│  - CI/CD Config │    │  - Deploy        │    │  - Serverless   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Troubleshooting

### Common Issues

1. **Build fails due to TypeScript errors**:
   - Check the CI pipeline allows type errors temporarily
   - Fix type errors gradually

2. **Vercel deployment fails**:
   - Verify environment variables are set
   - Check build logs in Vercel dashboard
   - Ensure `vercel.json` configuration is correct

3. **Database connection issues**:
   - Verify `DATABASE_URL` is correctly set
   - Ensure database is accessible from Vercel

### Build Scripts Explanation

- `npm run dev`: Starts development server with hot reload
- `npm run build`: Builds both frontend and backend for production
- `npm run start`: Starts production server
- `npm run check`: Runs TypeScript type checking
- `npm run db:push`: Pushes database schema changes

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Database connection tested
- [ ] GitHub secrets added
- [ ] CI/CD pipeline tested
- [ ] Production deployment verified
- [ ] Domain configured (if custom domain needed)
- [ ] SSL certificate active
- [ ] Performance monitoring setup

## Support

If you encounter issues:
1. Check GitHub Actions logs for build errors
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Ensure database is accessible and migrations are applied