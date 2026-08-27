import "dotenv/config";
import { fetchAllStaysFromDb, fetchStayByIdFromDb } from "../lib/staysDb";

async function test() {
  const stays = await fetchAllStaysFromDb();
  console.log(`Fetched ${stays.length} stays from Neon DB:`);
  stays.forEach((s) => {
    console.log(`- Stay ID: ${s.id} | Title: ${s.title} | City: ${s.city} | Rooms: ${s.rooms?.length}`);
  });
}

test();
