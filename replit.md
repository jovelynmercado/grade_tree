# GradeTree - BST Student Grade Management System

## Overview
GradeTree is a comprehensive student grade management system that features Binary Search Tree (BST) visualization for educational purposes. The application supports two user roles: administrators and students, each with their own dedicated interfaces.

## Current State
The application is fully functional with complete frontend and backend implementation using in-memory storage.

## Features

### Authentication
- Role-based login system (Admin/Student)
- Protected routes with automatic redirects
- Demo credentials available on login page

### Admin Features
- **Dashboard**: Overview statistics (total students, subjects, assessments, average grades)
- **Student Management**: Full CRUD operations for student records with subject enrollment
- **Subject Management**: Create, edit, and delete subjects with codes, titles, and descriptions
- **Assessment Management**: Create assessments with categories (quiz, exam, project, assignment) and weights
- **Grade Entry**: Grid-based interface for entering/editing student grades with auto-save
- **BST Visualizer**: Interactive Binary Search Tree with insert, search, and traversal operations (in-order, pre-order, post-order)
- **Analytics**: Grade distribution charts by subject using Recharts

### Student Features
- **Dashboard**: View personal grades organized by subject with calculated weighted averages

## Demo Credentials
- **Admin**: admin@gmail.com / admin123
- **Student**: student1@hcdc.edu.ph / student123

## Project Architecture

### Frontend (client/)
- React with TypeScript
- Vite for build tooling
- TanStack Query for data fetching
- Wouter for routing
- Shadcn/ui components with Tailwind CSS
- Recharts for analytics visualization

### Backend (server/)
- Express.js with TypeScript
- In-memory storage (MemStorage class)
- RESTful API endpoints

### Shared (shared/)
- Drizzle-Zod schemas for type-safe validation
- Shared types between frontend and backend

## Key Files
- `client/src/App.tsx` - Main app with routing and layouts
- `client/src/lib/auth-context.tsx` - Authentication context provider
- `client/src/lib/bst.ts` - Binary Search Tree implementation
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - In-memory storage with seeded data
- `shared/schema.ts` - Data models and validation schemas

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PATCH /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Subjects
- `GET /api/subjects` - List all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject
- `PATCH /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Assessments
- `GET /api/assessments` - List all assessments
- `GET /api/assessments/:id` - Get assessment by ID
- `POST /api/assessments` - Create assessment
- `PATCH /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Grades
- `GET /api/grades` - List all grades
- `GET /api/grades/:id` - Get grade by ID
- `POST /api/grades` - Create/upsert grade
- `PATCH /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

### Analytics
- `GET /api/analytics/subjects` - Get grade analytics by subject
- `GET /api/dashboard/stats` - Get dashboard statistics

## Running the Application
The application runs via the "Start application" workflow which executes `npm run dev`. This starts both the Express backend and Vite frontend on port 5000.

## Recent Changes
- Completed full implementation of BST Student Grade Management System
- Implemented all CRUD operations for students, subjects, assessments, and grades
- Created BST visualizer with SVG rendering
- Added analytics dashboard with Recharts
- Implemented role-based authentication and protected routes
