import { Client } from "pg";
import { promises as fs } from "fs";

export async function getFixtures() {
  try {
    const caCert = await fs.readFile(
      process.cwd() + "/certification/global-bundle.pem",
      "utf8",
    );

    //create client, by default, SSL is enabled
    const client = await new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        sslmode: "require",
        ca: caCert,
      },
    });

    // Connect to the database
    await client.connect();

    // Execute a query to retrieve data from the fixtures table
    const result = await client.query("SELECT * FROM public.fixtures");

    // Retrieve the data from the result
    const fixturesData = result.rows;

    // Close the database connection
    await client.end();

    return fixturesData;
  } catch (error) {
    console.error("getFixtures error: ", error);

    throw new Error("Failed to get fixtures from Supabase");
  }
}
