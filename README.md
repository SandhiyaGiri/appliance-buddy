# Home Appliance Tracker

A full-stack web application for managing home appliances, built with React, Node.js, and Supabase.

## 🚀 Features

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Supabase
- **Database**: PostgreSQL with Supabase
- **Authentication**: User signup/signin with Supabase Auth
- **UI Components**: Modern design with shadcn/ui components
- **Appliance Management**: Track appliances, maintenance, warranties, and support contacts

## 📁 Project Structure

```
homeappliances/
├── appliance-buddy/          # Frontend React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Application pages
│   │   ├── contexts/        # React contexts
│   │   └── hooks/           # Custom hooks
│   └── package.json
├── backend/                  # Backend Node.js API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Express middleware
│   └── package.json
├── package.json             # Root package.json for monorepo
├── start.sh                 # Startup script for deployment
├── Dockerfile              # Docker configuration
├── .railpackrc             # Railpack deployment config
└── Procfile                # Alternative deployment config
```

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Local Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   - Create `.env` files in both `appliance-buddy/` and `backend/` directories
   - See `ENVIRONMENT_VARIABLES.md` for details

3. **Start development servers**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🚀 Deployment

### Railpack Deployment

This project is configured for deployment on Railpack:

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Install Command**: `npm run install:all`

### Environment Variables

Set these environment variables in your deployment platform:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=your-frontend-url
```

### Database Setup

1. Create tables in Supabase using the SQL scripts in the backend documentation
2. Set up Row Level Security (RLS) policies
3. Run the seed script to populate sample data

## 📚 Documentation

- [Backend API Documentation](backend/README.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Environment Variables](ENVIRONMENT_VARIABLES.md)
- [Communication Flow](COMMUNICATION_FLOW.md)

## 🧪 Testing

```bash
# Run frontend tests
cd appliance-buddy && npm test

# Run backend tests
cd backend && npm test
```

## 📝 Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start the production server
- `npm run install:all` - Install dependencies for all packages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Open an issue on GitHub
3. Contact the development team

---

**Happy Coding! 🚀**
