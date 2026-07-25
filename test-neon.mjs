import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

try {
  const result = await sql`SELECT NOW()`;
  console.log(result);
} catch (e) {
  console.error(e);
}