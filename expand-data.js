import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_2usYvlfKM8kZ@ep-orange-grass-adzf2kjo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function expandData() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Get all students
    const students = await client.query('SELECT id FROM students ORDER BY student_id');
    console.log(`\nFound ${students.rows.length} students`);

    // Get existing subjects
    const existingSubjects = await client.query('SELECT id, code FROM subjects');
    console.log(`Found ${existingSubjects.rows.length} existing subjects\n`);

    // Add more subjects
    console.log('📚 Adding more subjects...');
    const newSubjects = [
      { code: 'MATH101', title: 'Calculus I', description: 'Introduction to differential and integral calculus' },
      { code: 'PHYS101', title: 'Physics I', description: 'Mechanics and thermodynamics' },
      { code: 'CHEM101', title: 'Chemistry', description: 'General chemistry principles' },
      { code: 'ENG102', title: 'Literature', description: 'World literature and composition' },
    ];

    const allSubjects = [...existingSubjects.rows];

    for (const subj of newSubjects) {
      const existing = await client.query('SELECT id FROM subjects WHERE code = $1', [subj.code]);
      if (existing.rows.length === 0) {
        const result = await client.query(
          'INSERT INTO subjects (code, title, description) VALUES ($1, $2, $3) RETURNING id',
          [subj.code, subj.title, subj.description]
        );
        allSubjects.push(result.rows[0]);
        console.log(`  ✓ Added: ${subj.code} - ${subj.title}`);
      }
    }

    // Add assessments for each subject
    console.log('\n📝 Adding assessments for each subject...');
    let totalAssessments = 0;

    for (const subject of allSubjects) {
      const assessmentTypes = [
        { name: 'Quiz 1', category: 'quiz', weight: 10, maxScore: 25 },
        { name: 'Quiz 2', category: 'quiz', weight: 10, maxScore: 25 },
        { name: 'Midterm Exam', category: 'exam', weight: 30, maxScore: 100 },
        { name: 'Lab/Project', category: 'project', weight: 25, maxScore: 100 },
        { name: 'Assignment', category: 'assignment', weight: 15, maxScore: 50 },
        { name: 'Final Exam', category: 'exam', weight: 35, maxScore: 100 },
      ];

      for (const assessment of assessmentTypes) {
        const existing = await client.query(
          'SELECT id FROM assessments WHERE name = $1 AND subject_id = $2',
          [assessment.name, subject.id]
        );

        if (existing.rows.length === 0) {
          await client.query(
            'INSERT INTO assessments (subject_id, name, category, weight, max_score) VALUES ($1, $2, $3, $4, $5)',
            [subject.id, assessment.name, assessment.category, assessment.weight, assessment.maxScore]
          );
          totalAssessments++;
        }
      }
    }
    console.log(`  ✓ Added ${totalAssessments} new assessments\n`);

    // Get all assessments
    const allAssessments = await client.query('SELECT id, subject_id, max_score FROM assessments');
    console.log(`Total assessments in DB: ${allAssessments.rows.length}`);

    // Add grades for all students in all assessments
    console.log('\n📊 Adding grade entries...');
    let gradesToAdd = 0;

    // Generate realistic scores
    const scoreVariations = [78, 82, 85, 88, 90, 92, 95, 75, 80, 87, 89, 91, 93, 96, 77, 83, 86, 89, 91, 94];

    for (let i = 0; i < students.rows.length; i++) {
      const studentId = students.rows[i].id;
      let scoreIndex = i * 3; // Vary scores per student

      for (const assessment of allAssessments.rows) {
        const existing = await client.query(
          'SELECT id FROM grades WHERE student_id = $1 AND assessment_id = $2',
          [studentId, assessment.id]
        );

        if (existing.rows.length === 0) {
          const percentScore = scoreVariations[scoreIndex % scoreVariations.length];
          scoreIndex++;
          const actualScore = Math.round((percentScore / 100) * assessment.max_score);
          const remarks =
            percentScore >= 90 ? 'Excellent' :
            percentScore >= 85 ? 'Very Good' :
            percentScore >= 80 ? 'Good' :
            percentScore >= 75 ? 'Satisfactory' :
            'Needs Improvement';

          await client.query(
            'INSERT INTO grades (student_id, assessment_id, subject_id, score, remarks) VALUES ($1, $2, $3, $4, $5)',
            [studentId, assessment.id, assessment.subject_id, actualScore, remarks]
          );
          gradesToAdd++;
        }
      }
    }

    console.log(`  ✓ Added ${gradesToAdd} new grade entries\n`);

    // Final summary
    const finalSubjects = await client.query('SELECT COUNT(*) as count FROM subjects');
    const finalAssessments = await client.query('SELECT COUNT(*) as count FROM assessments');
    const finalGrades = await client.query('SELECT COUNT(*) as count FROM grades');

    console.log('✅ Expansion completed!\n');
    console.log('📋 Updated Database Summary:');
    console.log(`  Total Subjects: ${finalSubjects.rows[0].count}`);
    console.log(`  Total Assessments: ${finalAssessments.rows[0].count}`);
    console.log(`  Total Grade Entries: ${finalGrades.rows[0].count}`);
    console.log(`  Total Students: ${students.rows.length}`);
    console.log(`  Average Grades per Student: ${Math.round(finalGrades.rows[0].count / students.rows.length)}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

expandData();
