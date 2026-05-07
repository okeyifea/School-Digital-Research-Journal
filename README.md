# FACIT Journal - Godfrey Okoye University

A comprehensive academic research journal management system for Godfrey Okoye University, featuring a university-wide structure with multiple colleges and faculties.

## Features

### University Structure

- **College of Medicine**
- **College of Nursing**
- **College of Law**
- **Faculty of Computing and Information Technology**
  - Software Engineering
  - Cybersecurity
  - Computer Science
- **Faculty of Management and Social Sciences**
  - International Relations
  - Accounting
  - Management
- **Faculty of Natural and Environmental Studies**
  - Biochemistry
  - Biotechnology
  - Industrial Chemical
  - Microbiology
- **Faculty of Arts**
  - Philosophy
  - History
- **Faculty of Education**

### User Roles

- **Students**: Submit research papers, track submissions
- **Staff**: Review student papers, submit own research
- **Officers**: Final approval authority, oversee academic processes

### Key Features

- ✅ MongoDB database (migrated from SQLite)
- ✅ Two-stage review workflow
- ✅ PDF upload and management
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional UI/UX
- ✅ JWT authentication
- ✅ Password reset functionality
- ✅ Citation tracking
- ✅ Advanced search and filtering

## Tech Stack

- **Frontend**: React 19, React Router, Styled Components
- **Backend**: Node.js, Express 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd facit-journal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install MongoDB Community Edition**
   - Download MongoDB Community Server for Windows from the official MongoDB download page.
   - Run the installer and choose **Complete** setup.
   - Keep **Install MongoDB as a Service** enabled so MongoDB starts automatically with Windows.
   - Finish the installation.

4. **Confirm MongoDB is running**
   - Open PowerShell and check the MongoDB service:

   ```powershell
   Get-Service MongoDB
   ```

   - If the service is not running, start it with:

   ```powershell
   Start-Service MongoDB
   ```

   - This project expects MongoDB on the default local address:

   ```text
   mongodb://localhost:27017/facit_journal
   ```

5. **Environment setup**
   - Create or update the `.env` file with the following variables:

   ```env
   MONGODB_URI=mongodb://localhost:27017/facit_journal
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

6. **Optional: use MongoDB Atlas instead of local MongoDB**
   - Create a cluster in MongoDB Atlas.
   - Copy your connection string.
   - Replace `MONGODB_URI` in `.env` with your Atlas URI.
   - Make sure your database user, password, and IP access rules are configured in Atlas.

7. **Start the application**

   ```bash
   # Start the backend server
   npm run server

   # In another terminal, start the frontend
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - When the backend starts successfully, it will connect to MongoDB and seed the default categories and sample users automatically.

## Quick Start On Windows

Open two PowerShell terminals in the project folder.

Terminal 1:

```powershell
npm run server
```

Terminal 2:

```powershell
npm run dev
```

If MongoDB was installed as a Windows service, it should already be available. If not, start it first:

```powershell
Start-Service MongoDB
```

## Default Users

The system comes with pre-seeded users for testing:

| Username | Password    | Role    | College                                         | Department       |
| -------- | ----------- | ------- | ----------------------------------------------- | ---------------- |
| student1 | password123 | Student | Faculty of Computing and Information Technology | Computer Science |
| staff1   | password123 | Staff   | Faculty of Computing and Information Technology | Computer Science |
| officer1 | password123 | Officer | Faculty of Computing and Information Technology | Computer Science |

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Password reset completion

### Research Papers

- `POST /api/research` - Submit paper
- `GET /api/research` - List papers (with filters)
- `GET /api/research/my-papers` - User's papers
- `DELETE /api/research/:id` - Delete paper

### Reviews

- `POST /api/review` - Submit review decision

### Dashboards

- `GET /api/dashboard/student` - Student dashboard
- `GET /api/dashboard/staff` - Staff dashboard
- `GET /api/dashboard/officer` - Officer dashboard

## Database Schema

### Users

- Personal information, role, college, department
- Authentication credentials

### Research Papers

- Title, authors, abstract, PDF file
- Submission metadata and status
- Review tracking

### Reviews

- Paper-reviewer relationships
- Approval decisions and comments

### Categories

- Research paper classifications

## Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Single-column layout with bottom navigation

## Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run backend server
npm run server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
