# Recruitment Platform Backend

A Node.js/Express.js backend API for a recruitment platform with JWT authentication and MongoDB integration.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- User profile management
- Input validation and sanitization
- Rate limiting and security middleware
- TypeScript support
- MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.x
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **TypeScript**: 5.3.0

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB 4.4+ or MongoDB Atlas
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/recruitment-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Profile

- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)
- `DELETE /api/profile` - Delete user profile (protected)

### Health Check

- `GET /api/health` - Server health check

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts      # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Auth logic
│   │   └── profileController.ts # Profile logic
│   ├── middleware/
│   │   └── auth.ts          # JWT authentication
│   ├── models/
│   │   └── User.ts          # User model
│   ├── routes/
│   │   ├── auth.ts          # Auth routes
│   │   └── profile.ts       # Profile routes
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── server.ts            # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- Environment-based configuration

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Remove build directory

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/recruitment-platform` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## License

MIT