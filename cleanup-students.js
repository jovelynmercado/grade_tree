import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_2usYvlfKM8kZ@ep-orange-grass-adzf2kjo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function cleanupStudents() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Delete login history for students
    await client.query("DELETE FROM login_history WHERE role = 'student'");
    console.log('✓ Deleted login history for students');

    // Delete grades for students
    await client.query("DELETE FROM grades WHERE student_id IN (SELECT id FROM students)");
    console.log('✓ Deleted grades');

    // Delete students
    await client.query("DELETE FROM students");
    console.log('✓ Deleted all students');

    // Delete student user accounts
    await client.query("DELETE FROM users WHERE role = 'student'");
    console.log('✓ Deleted student user accounts');

    // Verify
    const users = await client.query("SELECT email, role FROM users");
    console.log('\n📋 Remaining users in database:');
    users.rows.forEach(u => console.log(`  - ${u.email} (${u.role})`));

    const students = await client.query("SELECT COUNT(*) as count FROM students");
    console.log(`\n📊 Total students: ${students.rows[0].count}`);

    console.log('\n✅ Database cleanup completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

cleanupStudents();
