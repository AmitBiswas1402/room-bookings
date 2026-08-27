import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { eq, not, inArray } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const allUsers = await db.select().from(schema.users);
  console.log("=== ALL USERS IN DB ===");
  allUsers.forEach((u) => {
    console.log(`- User ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
  });

  const allProps = await db.select().from(schema.properties);
  console.log("\n=== ALL PROPERTIES IN DB ===");
  allProps.forEach((p) => {
    console.log(`- Property ID: ${p.id} | Name: ${p.name} | City: ${p.city} | HostId: ${p.hostId}`);
  });
}

main();
