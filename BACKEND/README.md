# FACIT Journal Backend

Express.js + MongoDB backend API for the FACIT Journal application.

## Features

- **User Authentication**: JWT-based authentication with login/signup
- **Research Paper Management**: CRUD operations for research papers
- **User Roles**: Support for student, staff, and officer roles
- **File Uploads**: Handle PDF and document uploads via Multer
- **Email Notifications**: Send emails for password resets and notifications
- **Database**: MongoDB integration with Mongoose ORM

## Project Structure

```
BACKEND/
├── api/                   # Vercel serverless functions
│   ├── [...slug].js      # Catch-all route handler
│   └── index.js          # Main API wrapper
├── API/                  # Express route handlers
│   ├── Auth.js          # Authentication routes
│   ├── Pass.js          # Password routes
│   ├── restPass.js      # Password reset routes
│   ├── Dashboard.js     # Dashboard routes
│   ├── Review.js        # Paper review routes
│   └── research.js      # Research paper routes
├── Middleware/          # Express middleware
│   └── authMiddleware.js
├── Models/              # Mongoose schemas
│   ├── paper.js
│   └── review.js
├── service/             # Business logic
│   ├── researchService.js
│   └── userServer.js
├── seeds/               # Database seeders
│   └── seedResearchPapers.js
├── uploads/             # Uploaded files directory
├── app.js              # Express app setup
├── db.js               # Database connection
├── server.js           # Server entry point
├── package.json        # Dependencies
└── vercel.json         # Vercel deployment config
```

## Installation

```bash
cd BACKEND
npm install
```

## Environment Variables

Create `.env` file in the BACKEND directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/facit_journal
JWT_SECRET=your-secure-jwt-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Development

```bash
npm run dev
```

Server runs at `http://localhost:5000`

## Database Seeding

Seed initial data:

```bash
npm run seed:papers
```

## API Routes

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/signup`
- **Research Papers**: `GET/POST /api/research`
- **Dashboard**: `GET /api/dashboard`
- **Reviews**: `GET/POST /api/reviews`
- **File Uploads**: `POST /uploads`

## Deployment (Vercel)

Serverless functions enabled via `api/[...slug].js`. Deploy with:

```bash
vercel --prod
```

## Tech Stack

- **Express** 5.2.1
- **MongoDB** with Mongoose 8.0.0
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Serverless HTTP** for Vercel deployment
