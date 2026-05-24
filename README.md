# StartupHR's Priority Talent

A modern job listing and talent acquisition platform built by **Digital20 Team**. Currently hosted on the [Demo Server](https://demo.d20.com.ng/).

## Tech Stack

- **Frontend:** React SPA with Vite + Vanilla CSS (glassmorphism design)
- **Backend:** PHP API
- **Database:** MySQL via PDO
- **Routing:** Custom PHP routing with `.htaccess` for SPA URLs

## Features

- **Job Listings** - Browse and search open positions
- **Application System** - Multi-step quiz-style application forms
- **Admin Dashboard** - For HR staff to manage candidates and jobs
- **Staff Management** - Admin can manage HR team members
- **Email Templates** - Customizable email templates with dynamic variables
- **Activity Logs** - Full audit trail of all actions

## Demo Accounts

### HR Staff
- **Email:** `staff@startuphr.africa`
- **Password:** `staff123`

### Admin
- **Email:** `admin@startuphr.africa`
- **Password:** `admin123`

## Getting Started

### Prerequisites

- Node.js (for frontend)
- PHP server (for backend API)
- MySQL database

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Configure your PHP backend and MySQL database connection

### Build for Production

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── context/         # React context (auth)
│   └── data/            # Static data
├── backend/             # PHP API files
├── public/              # Static assets
└── dist/                # Production build
```

## License

Private - All rights reserved