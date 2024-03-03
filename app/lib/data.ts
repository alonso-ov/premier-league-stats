import { connectToDatabase } from "./db";

export async function getFixtures() {
  try {
    const client = await connectToDatabase();

    const result = await client.query("SELECT * FROM public.fixtures");
    const fixturesData = result.rows;

    await client.end();

    return fixturesData;
  } catch (error) {
    console.error("getFixtures error: ", error);
    throw new Error("Failed to get fixtures from database");
  }
}
