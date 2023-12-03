export default async function getFixtures() {
  try {
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    requestHeaders.set("apikey", process.env.SUPABASE_ANON_KEY!);

    const response = await fetch(
      `${process.env.SUPABASE_PUBLIC_URL}/rest/v1/fixtures`,
      {
        method: "GET",
        headers: requestHeaders,
      }
    );

    const fixtures = await response.json();
    return fixtures;
  } catch (error) {
    console.error("getFixtures error: ", error);
    throw new Error("Failed to get fixtures from Supabase");
  }
}
