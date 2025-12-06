# GradeTree - BST-Based Student Grade Management System

A modular, full-stack digital grading workflow system using PostgreSQL for persistent data and a Binary Search Tree engine for optimized searching, ordering, and academic demonstration of data structure operations.

**Live Demo:** http://127.0.0.1:5000

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Features](#features)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [User Roles & Access](#user-roles--access)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)
- [Demo Credentials](#demo-credentials)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Visual Studio Code (VSCode)**
   - Download: https://code.visualstudio.com/download
   - Used for development, debugging, and file editing

2. **Node.js (v20+)**
   - Download: https://nodejs.org/en
   - Provides JavaScript runtime and npm package manager
   - Verify installation: `node --version` and `npm --version`

3. **Git**
   - Download: https://git-scm.com/downloads/win
   - Used for version control and cloning repositories
   - Verify installation: `git --version`

4. **PostgreSQL Database (Neon Cloud)**
   - Sign up: https://neon.tech
   - Create free account using GitHub login
   - Create a new PostgreSQL database project
   - Copy your DATABASE_URL connection string

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
# Navigate to where you want to store the project
cd your-desired-folder

# Clone the repository
git clone https://github.com/jovelynmercado/grade_tree.git

# Navigate into the project
cd grade_tree
```

### Step 2: Install Dependencies

```bash
# Install all required npm packages
npm install
```

This will install:
- **Frontend**: React, TanStack Query, Tailwind CSS, Shadcn/ui components
- **Backend**: Express.js, Drizzle ORM, PostgreSQL client
- **Build Tools**: Vite, TypeScript, tsx compiler

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database connection (from Neon)
DATABASE_URL=postgresql://your_user:your_password@your-host/your_database?sslmode=require&channel_binding=require

# Server port
PORT=5000

# Environment
NODE_ENV=development
```

**How to get your DATABASE_URL:**

1. Go to https://neon.tech and sign in with GitHub
2. Create a new PostgreSQL project
3. Copy the connection string from the dashboard
4. Replace `[PASSWORD]` with your actual password
5. Paste the full URL as `DATABASE_URL` in your `.env` file

### Step 4: Initialize the Database

The database schema is automatically created when the server starts for the first time. The system uses Drizzle ORM to manage migrations.

If you need to manually push the schema:

```bash
npm run db:push
```

### Step 5: Seed Initial Data (Optional)

To populate the database with sample data:

```bash
# Seed base database (users, subjects)
node seed-db.js

# Add 5 test students with grades
node seed-students.js

# Add more subjects and assessments
node expand-data.js
```

---

## Project Structure

```
grade_tree/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── login.tsx           # Authentication page
│   │   │   ├── admin/              # Admin pages
│   │   │   │   ├── dashboard.tsx   # Admin dashboard
│   │   │   │   ├── students.tsx    # Student management
│   │   │   │   ├── subjects.tsx    # Subject management
│   │   │   │   ├── assessments.tsx # Assessment management
│   │   │   │   ├── grades.tsx      # Grade entry
│   │   │   │   ├── bst.tsx         # BST visualizer
│   │   │   │   └── analytics.tsx   # Reports & analytics
│   │   │   └── student/
│   │   │       └── dashboard.tsx   # Student dashboard
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn UI components
│   │   │   ├── admin-sidebar.tsx   # Admin navigation
│   │   │   └── student-header.tsx  # Student header
│   │   ├── hooks/
│   │   │   ├── use-toast.ts        # Toast notifications
│   │   │   └── use-mobile.tsx      # Mobile detection
│   │   ├── lib/
│   │   │   ├── auth-context.tsx    # Authentication state
│   │   │   ├── bst.ts              # BST implementation
│   │   │   ├── queryClient.ts      # TanStack Query setup
│   │   │   └── utils.ts            # Utility functions
│   │   └── index.css               # Global styles (Tailwind)
│   └── index.html                  # HTML entry point
│
├── server/                          # Express.js backend
│   ├── routes.ts                   # API endpoint definitions
│   ├── db.ts                       # Database connection
│   ├── db-storage.ts               # Data access layer
│   ├── index.ts                    # Server entry point
│   ├── static.ts                   # Static file serving
│   └── vite.ts                     # Vite dev server setup
│
├── shared/
│   └── schema.ts                   # Zod schemas & TypeScript types
│
├── script/
│   └── build.ts                    # Build script
│
├── .env                            # Environment variables
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS setup
├── vite.config.ts                  # Vite bundler configuration
├── drizzle.config.ts               # Drizzle ORM configuration
└── README.md                       # This file
```

---

## Features

### 👨‍💼 Admin Features

#### Student Management
- ✅ Add, edit, delete students
- ✅ Auto-enroll new students in all subjects
- ✅ Mark students as "NEW" for quick identification
- ✅ View login history
- ✅ Manage student enrollment in subjects

#### Subject Management
- ✅ Create, edit, delete subjects
- ✅ Assign course codes and descriptions
- ✅ View subject statistics

#### Assessment Management
- ✅ Create assessments with categories (Quiz, Exam, Project, Assignment)
- ✅ Set assessment weights and max scores
- ✅ Edit and delete assessments
- ✅ View assessment statistics

#### Grade Management
- ✅ Enter grades per student per assessment
- ✅ Auto-compute weighted final grades
- ✅ Edit existing grades
- ✅ Delete grade entries
- ✅ View grade history

#### BST Visualization
- ✅ Build Binary Search Tree from:
  - Student IDs
  - Final grades
  - Assessment scores
- ✅ Visual tree representation
- ✅ Step-by-step insert/search operations
- ✅ Multiple traversal modes (In-order, Pre-order, Post-order)
- ✅ Educational demonstration mode

#### Analytics & Reports
- ✅ Grade distribution charts
- ✅ Top/low performer lists
- ✅ Subject-level statistics
- ✅ Export reports (CSV/PDF ready)

### 👨‍🏫 Teacher Features
- ✅ View assigned classes/subjects
- ✅ Enter and update grades
- ✅ View real-time computed final grades
- ✅ Generate grade sheets
- ✅ Access class analytics
- ✅ Run BST visualizations for their classes

### 👨‍🎓 Student Features
- ✅ Login with credentials
- ✅ View personal profile
- ✅ View all grades by subject
- ✅ Download grade summaries (PDF ready)
- ✅ View BST learning mode (educational)
- ✅ Access archived grades

---

## Database Setup

### Schema Overview

The application uses PostgreSQL with the following main tables:

```sql
-- Users (authentication)
users (id, email, password, role, name, studentId, createdAt)

-- Students (academic records)
students (id, studentId, name, email, enrolledSubjects[], isActive, isNew, createdAt)

-- Subjects (courses)
subjects (id, code, title, description)

-- Assessments (tests, assignments, etc.)
assessments (id, subjectId, name, category, weight, maxScore)

-- Grades (student performance)
grades (id, studentId, assessmentId, subjectId, score, remarks)

-- Login History (audit trail)
loginHistory (id, userId, email, role, loginAt, ipAddress, userAgent)
```

### Auto-Enrollment Feature

When a new student logs in for the first time:
1. System checks if student account exists
2. If not, automatically creates student record
3. **Automatically enrolls them in all active subjects**
4. Creates user account with provided credentials
5. Marks student as `isNew = true` for admin visibility

---

## Running the Application

### Development Mode

```bash
# Start the development server (frontend + backend)
npm run dev
```

This will:
- Start Express.js server on http://127.0.0.1:5000
- Start Vite dev server with hot module reloading
- Connect to your PostgreSQL database

### Access the Application

**The application will be available at:** http://127.0.0.1:5000

> **💡 Tip:** If you're unsure where to go, just navigate to http://127.0.0.1:5000/ in your browser and you'll be redirected to the login page.

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Type Checking

```bash
# Check for TypeScript errors
npm run check
```

---

## User Roles & Access

### Role: Admin
**Default Credentials:**
- Email: `admin@gmail.com`
- Password: `admin123`

**Access Level:**
- Full system access
- All student management
- All grade management
- All reports & analytics
- System administration
- Login history viewing

**Dashboard:** `/admin/dashboard`

### Role: Student
**Access Level:**
- Personal grade viewing
- Subject enrollment info
- Personal performance analytics
- Limited to own data only

**Dashboard:** `/student/dashboard`

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- Auto-creates new student accounts on first login

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PATCH /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/mark-read` - Mark student as "read"

### Subjects
- `GET /api/subjects` - List subjects
- `GET /api/subjects/:id` - Get subject details
- `POST /api/subjects` - Create subject
- `PATCH /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Assessments
- `GET /api/assessments` - List assessments
- `GET /api/assessments/subject/:subjectId` - Get assessments by subject
- `POST /api/assessments` - Create assessment
- `PATCH /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Grades
- `GET /api/grades` - List all grades
- `GET /api/grades/student/:studentId` - Get student's grades
- `GET /api/grades/subject/:subjectId` - Get subject's grades
- `POST /api/grades` - Create/upsert grade
- `PATCH /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Static typing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - High-quality React components
- **TanStack Query** - Server state management
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Wouter** - Client-side routing
- **Lucide Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Static typing
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database (via Neon)
- **Zod** - Request validation

### Development Tools
- **tsx** - TypeScript executor
- **Vite** - Fast module bundler
- **TypeScript** - Type checking

---

## Demo Credentials

### Admin Accounts

**Admin Account**
```
Email: admin@gmail.com
Password: admin123
```

### Test Student Accounts
The following students are available to log in:

1. **Jovelyn Angel Mercado**
   - Email: jovelynangel.mercado@hcdc.edu.ph
   - Password: jovelynangel.mercado@hcdc.edu.ph

2. **Alice Johnson**
   - Student ID: 2024-0001
   - Email: alice.johnson@hcdc.edu.ph
   - Password: password123

3. **Bob Smith**
   - Student ID: 2024-0002
   - Email: bob.smith@hcdc.edu.ph
   - Password: password123

4. **Carol White**
   - Student ID: 2024-0003
   - Email: carol.white@hcdc.edu.ph
   - Password: password123

5. **David Brown**
   - Student ID: 2024-0004
   - Email: david.brown@hcdc.edu.ph
   - Password: password123

6. **Emma Davis**
   - Student ID: 2024-0005
   - Email: emma.davis@hcdc.edu.ph
   - Password: password123

---

## Common Issues & Troubleshooting

### Issue: "Cannot find module './db'"
**Solution:**
```bash
# Clear build cache
rm -r node_modules/.vite
# Restart dev server
npm run dev
```

### Issue: Database Connection Error
**Solution:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check Neon database is running and active
3. Ensure your IP is whitelisted (if applicable)
4. Test connection:
   ```bash
   npx drizzle-kit introspect
   ```

### Issue: Port 5000 Already in Use
**Solution:**
```bash
# Kill process on port 5000
# Windows PowerShell:
Get-Process | Where-Object {$_.ProcessName -match 'node'} | Stop-Process -Force

# Change port in .env:
PORT=5001
```

### Issue: Module Import Error During Build
**Solution:**
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install

# Clear build cache
rm -r dist
npm run build
```

### Issue: Student Auto-Enrollment Not Working
**Verify:**
1. Subject records exist in database
2. Login endpoint is properly configured
3. Check server logs for errors
4. Ensure database permissions are correct

### Issue: Hot Reload Not Working
**Solution:**
```bash
# Restart dev server
npm run dev

# Or clear Vite cache
rm -r .vite
npm run dev
```

---

## Development Workflow

### Making Changes

1. **Frontend Changes**
   - Edit files in `client/src/`
   - Changes auto-reload with Vite HMR
   - TypeScript errors appear in terminal

2. **Backend Changes**
   - Edit files in `server/`
   - Changes auto-reload with tsx
   - Restart server for environment variable changes

3. **Database Schema Changes**
   - Edit `shared/schema.ts`
   - Run `npm run db:push` to apply migrations
   - Verify changes in Neon dashboard

### Code Quality

```bash
# Type check entire project
npm run check

# View TypeScript errors
npm run check 2>&1 | head -50
```

---

## Deployment

### Deploying to Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables** in your hosting platform:
   - `DATABASE_URL` - PostgreSQL connection string
   - `PORT` - Server port (default: 5000)
   - `NODE_ENV` - Set to `production`

3. **Start the application:**
   ```bash
   npm run start
   ```

### Recommended Hosting Platforms
- **Vercel** - Optimal for Next.js, but works with Express
- **Render** - Good for Node.js full-stack apps
- **Railway** - Simple deployment with PostgreSQL
- **Fly.io** - Containerized deployment
- **DigitalOcean** - Complete control with App Platform

---

## Support & Documentation

### Getting Help

1. Check the [Common Issues](#common-issues--troubleshooting) section
2. Review code comments in `server/routes.ts` and `client/src/pages/`
3. Check browser console for frontend errors
4. Check terminal for backend errors

### Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs/)

---

## License

MIT License - feel free to use this project for educational and commercial purposes.

---

## Author

Created by **Jovelyn Mercado**

GitHub: https://github.com/jovelynmercado

---

## Changelog

### v1.0.0 (December 2025)
- ✅ Initial release
- ✅ Admin dashboard with student/subject/assessment management
- ✅ Grade entry and computation
- ✅ BST visualization
- ✅ Login history tracking
- ✅ Auto-enrollment for new students
- ✅ "NEW" student badge system
- ✅ PostgreSQL/Neon database integration

---

## Quick Start Summary

```bash
# 1. Clone repository
git clone https://github.com/jovelynmercado/grade_tree.git
cd grade_tree

# 2. Install dependencies
npm install

# 3. Configure .env with your DATABASE_URL from Neon

# 4. Start development server
npm run dev

# 5. Login at http://127.0.0.1:5000
# Email: admin@gmail.com
# Password: admin123

# 6. (Optional) Seed sample data
node seed-students.js
node expand-data.js
```

---

**Enjoy using GradeTree! 🌳**
