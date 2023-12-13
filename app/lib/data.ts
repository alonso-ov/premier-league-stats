export async function getFixtures() {
  try {
    const requestOptions: RequestInit = {
      method: "GET",
      headers: <any>{
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY,
      },
      cache: "no-cache",
    };

    const response = await fetch(
      `${process.env.SUPABASE_PUBLIC_URL}/rest/v1/fixtures`,
      requestOptions
    );

    const fixtures = await response.json();

    return fixtures;
  } catch (error) {
    console.error("getFixtures error: ", error);

    throw new Error("Failed to get fixtures from Supabase");
  }
}

export async function getMatch(fixture_id: number) {
  try {
    const requestOptions: RequestInit = {
      method: "GET",
      headers: <any>{
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": process.env.RAPID_API_HOST,
      },
    };

    let url = `${process.env.RAPID_API_URL}/fixtures?id=${fixture_id}`;

    const response = await fetch(url, requestOptions);

    const data = await response.json();

    return data;


  } catch (error) {
    console.error("getMatch error: ", error);

    throw new Error("Failed to get match data from Rapid API");
  }
}
