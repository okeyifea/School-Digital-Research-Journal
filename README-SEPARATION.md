# FACIT Journal - Separated Frontend & Backend

This directory structure contains the fully separated frontend and backend implementations of the FACIT Journal project.

## 📁 Project Structure

```
FACIT Journal/
├── FRONTEND/          # React.js frontend application
├── BACKEND/           # Express.js backend API
├── README.md          # This file
└── ...other files
```

## 🚀 Quick Start

### Frontend Setup

```bash
cd FRONTEND
npm install
npm run dev
```

**Frontend runs at**: `http://localhost:5173`

### Backend Setup

```bash
cd BACKEND
npm install
npm run dev
```

**Backend runs at**: `http://localhost:5000`

## 🔗 API Communication

The frontend connects to the backend using the `VITE_API_URL` environment variable.

**Frontend `.env`**:

```env
VITE_API_URL=http://localhost:5000
```

All frontend API calls are made to `${VITE_API_URL}/api/*`

## 📦 Deployment

### Frontend (Vercel)

```bash
cd FRONTEND
vercel --prod
```

### Backend (Vercel)

```bash
cd BACKEND
vercel --prod
```

## 🔐 Environment Configuration

### Frontend Environment Variables

- `VITE_API_URL`: Backend API URL (defaults to `/api` for relative paths)

### Backend Environment Variables

- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: JWT signing secret (should be a long random string)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS
- `EMAIL_USER` & `EMAIL_PASS`: Gmail/SMTP for email notifications

## 📚 Documentation

- [Frontend README](./FRONTEND/README.md) - Frontend setup and structure
- [Backend README](./BACKEND/README.md) - Backend setup and API documentation

## 🛠️ Development Workflow

1. **Start Backend**: `cd BACKEND && npm run dev`
2. **Start Frontend**: `cd FRONTEND && npm run dev`
3. **Access Application**: Visit `http://localhost:5173`

The frontend will automatically proxy API requests to the backend (configured in `vite.config.js`).

## 📋 Key Features

- **Authentication**: JWT-based login and signup
- **Paper Submission**: Upload and manage research papers
- **Paper Archive**: Search and browse published papers
- **Dashboard**: Role-based views for students, staff, and officers
- **User Profiles**: Personal information management
- **File Management**: PDF uploads and downloads

## 🔄 CI/CD & Deployment

Both applications are configured for independent Vercel deployment:

- Frontend: Static build with SPA routing
- Backend: Serverless functions with MongoDB Atlas

See individual README files for detailed deployment instructions.
