# Recruitment Platform

A full-stack recruitment platform built with React (frontend) and Node.js/Express (backend).

## Project Structure

```
recruitment-platform/
├── backend/          # Node.js/Express API server
├── frontend/         # React application with Vite
├── package.json      # Root package.json with common scripts
└── README.md         # This file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for backend database)

## Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

   Or install dependencies for each project separately:
   ```bash
   # Backend dependencies
   cd backend && npm install

   # Frontend dependencies
   cd frontend && npm install
   ```

## Development

### Start both frontend and backend together:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001` (or your configured port)
- Frontend development server on `http://localhost:5173` (Vite default)

### Start services individually:

**Backend only:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

**Frontend only:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

## Production

### Build both projects:
```bash
npm run build
```

### Start both services in production mode:
```bash
npm start
```

## Available Scripts

### Root level scripts:
- `npm run dev` - Start both frontend and backend in development mode
- `npm run start` - Start both services in production mode
- `npm run build` - Build both frontend and backend
- `npm run install:all` - Install dependencies for all projects
- `npm run clean` - Clean build artifacts from both projects

### Backend scripts (run from backend directory):
- `npm run dev` - Start backend in development mode with nodemon
- `npm run start` - Start backend in production mode
- `npm run build` - Build TypeScript to JavaScript
- `npm run clean` - Remove build artifacts

### Frontend scripts (run from frontend directory):
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Setup

1. **Backend environment:**
   - Copy `backend/.env.example` to `backend/.env`
   - Configure your database connection and JWT secrets

2. **Frontend environment:**
   - The frontend uses environment variables for API endpoints
   - Create `.env` files in the frontend directory if needed

## Technology Stack

### Backend:
- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend:
- React 19
- TypeScript
- Vite (build tool)
- React Router (routing)
- Tailwind CSS (styling)
- React Hook Form (forms)
- Axios (HTTP client)
- React Hot Toast (notifications)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

MIT