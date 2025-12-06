import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

async function main() {
  const client = new Client({ connectionString });
  const db = drizzle(client);

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

    // Update existing students to have isNew = false (they're not new anymore)
    await client.query(`
      UPDATE students 
      SET is_new = false 
      WHERE is_new IS NULL OR is_new = true;
    `);
    console.log("✓ Marked existing students as read");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
