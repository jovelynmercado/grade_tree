-- ========================================
-- Complete SQL Setup for Neon Database
-- ========================================

-- Drop existing tables if they exist (optional - use if you want to reset)
-- DROP TABLE IF EXISTS grades CASCADE;
-- DROP TABLE IF EXISTS assessments CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS subjects CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- CREATE TABLES
-- ========================================

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    name TEXT NOT NULL,
    student_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    enrolled_subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    subject_id VARCHAR NOT NULL REFERENCES subjects(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('quiz', 'exam', 'project', 'assignment')),
    weight REAL NOT NULL,
    max_score REAL NOT NULL
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id VARCHAR NOT NULL REFERENCES students(id),
    assessment_id VARCHAR NOT NULL REFERENCES assessments(id),
    subject_id VARCHAR NOT NULL REFERENCES subjects(id),
    score REAL NOT NULL,
    remarks TEXT
);

-- Login History table
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
);

-- ========================================
-- SEED DATA
-- ========================================

-- Insert Subjects
INSERT INTO subjects (id, code, title, description) VALUES
('12345678-1234-1234-1234-123456789001', 'CS201', 'Data Structures and Algorithms', 'Study of fundamental data structures and algorithmic techniques'),
('12345678-1234-1234-1234-123456789002', 'CS202', 'Database Management Systems', 'Principles and applications of database systems'),
('12345678-1234-1234-1234-123456789003', 'CS203', 'Object-Oriented Programming', 'Advanced concepts in OOP using modern programming languages')
ON CONFLICT (code) DO NOTHING;

-- Insert Users (Only Admin)
INSERT INTO users (id, email, password, role, name, student_id) VALUES
('admin-id-123456789012345678901234', 'admin@gmail.com', 'admin123', 'admin', 'System Administrator', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert Students
-- Student accounts will be created dynamically as needed
-- INSERT INTO students (id, student_id, name, email, enrolled_subjects, is_active) VALUES
-- No demo students for production

-- Insert Assessments
INSERT INTO assessments (id, subject_id, name, category, weight, max_score) VALUES
('assessment-id-1234567890123456789001', '12345678-1234-1234-1234-123456789001', 'Quiz 1', 'quiz', 10, 30),
('assessment-id-1234567890123456789002', '12345678-1234-1234-1234-123456789001', 'Midterm Exam', 'exam', 30, 100),
('assessment-id-1234567890123456789003', '12345678-1234-1234-1234-123456789001', 'BST Project', 'project', 25, 100),
('assessment-id-1234567890123456789004', '12345678-1234-1234-1234-123456789001', 'Final Exam', 'exam', 35, 100),
('assessment-id-1234567890123456789005', '12345678-1234-1234-1234-123456789002', 'SQL Assignment', 'assignment', 20, 50),
('assessment-id-1234567890123456789006', '12345678-1234-1234-1234-123456789002', 'Database Design Project', 'project', 40, 100)
ON CONFLICT (id) DO NOTHING;

-- Insert Grades
-- Grades will be recorded as students and assessments are created
-- No demo grades for production

-- ========================================
-- VERIFY DATA
-- ========================================

-- Check users
SELECT 'Users' as table_name, COUNT(*) as count FROM users;

-- Check students
SELECT 'Students' as table_name, COUNT(*) as count FROM students;

-- Check subjects
SELECT 'Subjects' as table_name, COUNT(*) as count FROM subjects;

-- Check assessments
SELECT 'Assessments' as table_name, COUNT(*) as count FROM assessments;

-- Check grades
SELECT 'Grades' as table_name, COUNT(*) as count FROM grades;
