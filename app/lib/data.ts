export default async function getFixtures() {
  try {
    const response = await fetch(`${process.env.SUPABASE_PUBLIC_URL}/rest/v1/fixtures`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY,
      },
    })

    const fixtures = await response.json();
    return fixtures;

  } catch (error) {
    console.error("getFixtures error: ", error);
    throw new Error("Failed to get fixtures from Supabase");
  }
}
