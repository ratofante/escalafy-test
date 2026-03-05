import { readFileSync } from "fs";
import { resolve } from "path";

const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const postgres = (await import("postgres")).default;
const sql = postgres(process.env.DATABASE_URL);

try {
  const result =
    await sql`SELECT current_database() AS db, current_user AS user`;
  console.log("✅ Connection successful!");
  console.log(`   Database : ${result[0].db}`);
  console.log(`   User     : ${result[0].user}`);

  const orgs = await sql`SELECT id, name FROM organization`;
  console.log(`\n📋 Organizations found: ${orgs.length}`);
  for (const org of orgs) console.log(`   [${org.id}] ${org.name}`);
} catch (err) {
  console.error("❌ Connection failed:", err.message);
} finally {
  await sql.end();
}
