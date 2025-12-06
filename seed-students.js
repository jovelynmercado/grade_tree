import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_2usYvlfKM8kZ@ep-orange-grass-adzf2kjo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function seedStudentData() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Get existing subjects
    const subjects = await client.query('SELECT id, code FROM subjects');
    console.log(`Found ${subjects.rows.length} subjects`);

    // Create assessments if they don't exist
    console.log('\n📝 Creating assessments...');
    const subjectId = subjects.rows[0].id;
    
    const assessmentNames = [
      { name: 'Quiz 1', category: 'quiz', weight: 10, maxScore: 30 },
      { name: 'Midterm Exam', category: 'exam', weight: 30, maxScore: 100 },
      { name: 'Project', category: 'project', weight: 25, maxScore: 100 },
      { name: 'Assignment', category: 'assignment', weight: 20, maxScore: 50 },
      { name: 'Final Exam', category: 'exam', weight: 35, maxScore: 100 },
    ];

    const assessmentIds = [];
    for (const assessment of assessmentNames) {
      const existing = await client.query(
        'SELECT id FROM assessments WHERE name = $1 AND subject_id = $2',
        [assessment.name, subjectId]
      );

      if (existing.rows.length > 0) {
        assessmentIds.push(existing.rows[0].id);
      } else {
        const result = await client.query(
          'INSERT INTO assessments (subject_id, name, category, weight, max_score) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [subjectId, assessment.name, assessment.category, assessment.weight, assessment.maxScore]
        );
        assessmentIds.push(result.rows[0].id);
        console.log(`  ✓ Created: ${assessment.name}`);
      }
    }

    // Create 5 students
    console.log('\n👥 Creating students...');
    const students = [
      { studentId: '2024-0001', name: 'Alice Johnson', email: 'alice.johnson@hcdc.edu.ph' },
      { studentId: '2024-0002', name: 'Bob Smith', email: 'bob.smith@hcdc.edu.ph' },
      { studentId: '2024-0003', name: 'Carol White', email: 'carol.white@hcdc.edu.ph' },
      { studentId: '2024-0004', name: 'David Brown', email: 'david.brown@hcdc.edu.ph' },
      { studentId: '2024-0005', name: 'Emma Davis', email: 'emma.davis@hcdc.edu.ph' },
    ];

    const studentIds = [];

    for (const studentData of students) {
      // Check if student exists
      const existing = await client.query(
        'SELECT id FROM students WHERE student_id = $1',
        [studentData.studentId]
      );

      let studentId;
      if (existing.rows.length > 0) {
        studentId = existing.rows[0].id;
        console.log(`✓ Student ${studentData.studentId} already exists`);
      } else {
        // Create student
        const result = await client.query(
          'INSERT INTO students (student_id, name, email, enrolled_subjects, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [studentData.studentId, studentData.name, studentData.email, subjects.rows.map(s => s.id), true]
        );
        studentId = result.rows[0].id;
        console.log(`✓ Created student: ${studentData.name}`);
      }
      
      studentIds.push(studentId);

      // Create user account if doesn't exist
      const userExists = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [studentData.email]
      );

      if (userExists.rows.length === 0) {
        await client.query(
          'INSERT INTO users (email, password, role, name, student_id) VALUES ($1, $2, $3, $4, $5)',
          [studentData.email, 'password123', 'student', studentData.name, studentData.studentId]
        );
        console.log(`  ✓ Created user account for ${studentData.name}`);
      }
    }

    // Add grades for each student
    console.log('\n📊 Adding grades...');
    const scores = [
      [88, 92, 85, 78, 90],  // Alice
      [75, 80, 88, 82, 85],  // Bob
      [92, 95, 90, 88, 93],  // Carol
      [78, 75, 82, 80, 79],  // David
      [85, 88, 92, 86, 89],  // Emma
    ];

    for (let i = 0; i < studentIds.length; i++) {
      for (let j = 0; j < assessmentIds.length; j++) {
        const existing = await client.query(
          'SELECT id FROM grades WHERE student_id = $1 AND assessment_id = $2',
          [studentIds[i], assessmentIds[j]]
        );

        if (existing.rows.length === 0) {
          const score = scores[i][j];
          await client.query(
            'INSERT INTO grades (student_id, assessment_id, subject_id, score, remarks) VALUES ($1, $2, $3, $4, $5)',
            [
              studentIds[i],
              assessmentIds[j],
              subjectId,
              score,
              score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : 'Satisfactory'
            ]
          );
        }
      }
      console.log(`  ✓ Added grades for ${students[i].name}`);
    }

    // Verify data
    console.log('\n✅ Data seeding completed!\n');
    
    const studentCount = await client.query('SELECT COUNT(*) as count FROM students WHERE student_id LIKE \'2024-%\'');
    const gradeCount = await client.query('SELECT COUNT(*) as count FROM grades');
    
    console.log('📋 Database Summary:');
    console.log(`  Total Students: ${studentCount.rows[0].count}`);
    console.log(`  Total Grades: ${gradeCount.rows[0].count}`);
    console.log(`  Total Subjects: ${subjects.rows.length}`);
    console.log(`  Total Assessments: ${assessmentIds.length}`);

    console.log('\n🔐 Student Login Credentials:');
    students.forEach(s => {
      console.log(`  ${s.email} / password123`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

seedStudentData();
