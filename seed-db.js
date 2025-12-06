import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_2usYvlfKM8kZ@ep-orange-grass-adzf2kjo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to Neon database');

    // Create tables
    console.log('Creating tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
          name TEXT NOT NULL,
          student_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          student_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          enrolled_subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
          is_active BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS subjects (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          code TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          description TEXT
      );

      CREATE TABLE IF NOT EXISTS assessments (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          subject_id VARCHAR NOT NULL REFERENCES subjects(id),
          name TEXT NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('quiz', 'exam', 'project', 'assignment')),
          weight REAL NOT NULL,
          max_score REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS grades (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          student_id VARCHAR NOT NULL REFERENCES students(id),
          assessment_id VARCHAR NOT NULL REFERENCES assessments(id),
          subject_id VARCHAR NOT NULL REFERENCES subjects(id),
          score REAL NOT NULL,
          remarks TEXT
      );
    `);
    console.log('✓ Tables created');

    // Seed subjects
    console.log('Seeding subjects...');
    await client.query(`
      INSERT INTO subjects (id, code, title, description) VALUES
      ('subject-001', 'CS201', 'Data Structures and Algorithms', 'Study of fundamental data structures and algorithmic techniques'),
      ('subject-002', 'CS202', 'Database Management Systems', 'Principles and applications of database systems'),
      ('subject-003', 'CS203', 'Object-Oriented Programming', 'Advanced concepts in OOP using modern programming languages')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✓ Subjects seeded');

    // Seed users
    console.log('Seeding users...');
    await client.query(`
      INSERT INTO users (id, email, password, role, name, student_id) VALUES
      ('user-admin-001', 'admin@gmail.com', 'admin123', 'admin', 'System Administrator', NULL),
      ('user-student-001', 'student1@hcdc.edu.ph', 'student123', 'student', 'Maria Santos', '2024-0001')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✓ Users seeded');

    // Seed students
    console.log('Seeding students...');
    await client.query(`
      INSERT INTO students (id, student_id, name, email, enrolled_subjects, is_active) VALUES
      ('student-001', '2024-0001', 'Maria Santos', 'student1@hcdc.edu.ph', ARRAY['subject-001', 'subject-002'], true),
      ('student-002', '2024-0002', 'Juan Dela Cruz', 'student2@hcdc.edu.ph', ARRAY['subject-001', 'subject-003'], true),
      ('student-003', '2024-0003', 'Ana Reyes', 'student3@hcdc.edu.ph', ARRAY['subject-001', 'subject-002', 'subject-003'], true)
      ON CONFLICT (student_id) DO NOTHING;
    `);
    console.log('✓ Students seeded');

    // Seed assessments
    console.log('Seeding assessments...');
    await client.query(`
      INSERT INTO assessments (id, subject_id, name, category, weight, max_score) VALUES
      ('assessment-001', 'subject-001', 'Quiz 1', 'quiz', 10, 30),
      ('assessment-002', 'subject-001', 'Midterm Exam', 'exam', 30, 100),
      ('assessment-003', 'subject-001', 'BST Project', 'project', 25, 100),
      ('assessment-004', 'subject-001', 'Final Exam', 'exam', 35, 100),
      ('assessment-005', 'subject-002', 'SQL Assignment', 'assignment', 20, 50),
      ('assessment-006', 'subject-002', 'Database Design Project', 'project', 40, 100)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Assessments seeded');

    // Seed grades
    console.log('Seeding grades...');
    await client.query(`
      INSERT INTO grades (id, student_id, assessment_id, subject_id, score, remarks) VALUES
      ('grade-001', 'student-001', 'assessment-001', 'subject-001', 28, 'Excellent'),
      ('grade-002', 'student-001', 'assessment-002', 'subject-001', 85, 'Good'),
      ('grade-003', 'student-001', 'assessment-003', 'subject-001', 92, 'Outstanding'),
      ('grade-004', 'student-001', 'assessment-005', 'subject-002', 45, 'Good work'),
      ('grade-005', 'student-002', 'assessment-001', 'subject-001', 25, 'Good'),
      ('grade-006', 'student-002', 'assessment-002', 'subject-001', 78, 'Keep it up'),
      ('grade-007', 'student-003', 'assessment-001', 'subject-001', 30, 'Perfect'),
      ('grade-008', 'student-003', 'assessment-002', 'subject-001', 95, 'Excellent'),
      ('grade-009', 'student-003', 'assessment-005', 'subject-002', 48, 'Great')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Grades seeded');

    // Verify data
    const tables = ['users', 'students', 'subjects', 'assessments', 'grades'];
    console.log('\n📊 Data verification:');
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table};`);
      console.log(`  ${table}: ${result.rows[0].count} records`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('  Admin: admin@gmail.com / admin123');
    console.log('  Student: student1@hcdc.edu.ph / student123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.end();
  }
}

seedDatabase();
