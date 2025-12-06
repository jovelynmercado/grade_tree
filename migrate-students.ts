import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_2usYvlfKM8kZ@ep-orange-grass-adzf2kjo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to database");

    // Add isNew and createdAt columns if they don't exist
    await client.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT true;
    `);
    console.log("✓ Added is_new column");

    await client.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log("✓ Added created_at column");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
