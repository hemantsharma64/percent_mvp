# Percent MVP

A full-stack productivity application built with React, TypeScript, and Express.js, featuring AI-powered task generation and goal tracking.

## 🚀 Features

- **Goal Tracking**: Set and monitor personal goals with duration tracking
- **AI Task Generation**: Automatically generate tasks based on your goals using OpenAI
- **Journal System**: Daily journaling with word count tracking
- **Progress Analytics**: Visual progress tracking and statistics
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for components
- **Framer Motion** for animations
- **TanStack Query** for data management

### Backend
- **Express.js** with **TypeScript**
- **Drizzle ORM** for database management
- **PostgreSQL** database
- **OpenAI API** integration
- **Passport.js** for authentication

### DevOps & Deployment
- **GitHub Actions** for CI/CD
- **Vercel** for deployment
- **ESBuild** for server bundling

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key (optional, for AI features)

### Installation

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
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up database**:
   ```bash
   npm run db:push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run lint` - Run TypeScript linter
- `npm run db:push` - Push database schema changes
- `npm run clean` - Clean build directory
- `npm run deploy` - Deploy to Vercel

## 🚀 Deployment

### Automated Deployment (Recommended)

The project includes a complete CI/CD pipeline using GitHub Actions that automatically deploys to Vercel on push to the main branch.

### Manual Deployment

Use the deployment helper script:
```bash
./deploy.sh
```

Or deploy manually:
```bash
npm run build
vercel --prod
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📁 Project Structure

```
percent_mvp/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── services/           # Business logic
│   └── routes.ts           # API routes
├── shared/                 # Shared types and utilities
├── dist/                   # Build output
├── vercel.json             # Vercel deployment config
├── package.json
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/percent_mvp
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_secure_session_secret
```

## 🧪 Development

### Running Tests

Currently, this project doesn't include a test suite. Testing can be added using:
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Cypress** or **Playwright** for E2E testing

### Type Checking

The project uses TypeScript for type safety:
```bash
npm run check  # Type check without emitting files
npm run lint   # Run type checking (alias for check)
```

### Database Schema

The project uses Drizzle ORM for database management. Schema files are located in the server directory.

## 📝 API Endpoints

- `GET /api/dashboard` - Get dashboard data
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `GET /api/tasks` - Get tasks
- `POST /api/tasks/generate` - Generate AI tasks
- `GET /api/journal` - Get journal entries
- `POST /api/journal` - Create journal entry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
2. Review the GitHub Actions logs
3. Check Vercel deployment logs
4. Open an issue in this repository

## 🔗 Links

- [Live Demo](https://your-vercel-url.vercel.app) (Update with actual URL)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

Made with ❤️ using React, TypeScript, and Express.js