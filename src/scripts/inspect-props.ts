import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const allProps = await db.select().from(schema.properties);
  console.log("Total properties in Neon DB:", allProps.length);
  allProps.forEach((p) => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | City: ${p.city} | Status: ${p.status}`);
  });
}

main();
