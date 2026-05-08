# FACIT Journal Frontend

React + Vite frontend for the FACIT Journal application.

## Features

- **User Authentication**: Login and signup with JWT-based tokens
- **Research Paper Archive**: Browse and search published papers
- **Paper Submission**: Submit research papers with file uploads
- **Dashboard**: Role-based dashboards for students, staff, and officers
- **User Profile**: Manage personal information and settings

## Project Structure

```
FRONTEND/
├── src/
│   ├── Component/          # React components
│   │   ├── Common/        # Reusable components
│   │   ├── Modals/        # Modal components
│   │   └── *.jsx          # Page components
│   ├── Style/             # Styled-components
│   ├── api/               # API client functions
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main app component
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## Installation

```bash
cd FRONTEND
npm install
```

## Development

```bash
npm run dev
```

Runs at `http://localhost:5173`

## Build

```bash
npm run build
```

Generates optimized build in `dist/` folder.

## API Integration

Frontend communicates with backend via environment variable `VITE_API_URL`:

- **Development**: `http://localhost:5000` (default)
- **Production**: Set `VITE_API_URL` in `.env` or deployment settings

## Environment Variables

Create `.env` file in the FRONTEND directory:

```env
VITE_API_URL=http://localhost:5000
```

## Tech Stack

- **React** 19.2.0
- **Vite** 7.2.4
- **React Router** 7.11.0
- **Styled Components** 6.1.19
