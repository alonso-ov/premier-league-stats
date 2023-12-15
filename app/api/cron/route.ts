import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Check if the request is authorized
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const now = new Date();
  const today = now.getDay();
  const sunday = new Date(now.setDate(now.getDate() - today));
  const saturday = new Date(now.setDate(now.getDate() + 6));

  const formatDate = (date: Date) => {
    const d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
  };

  const weekStart = formatDate(new Date(sunday));
  const weekEnd = formatDate(new Date(saturday));

  //get most recent data from foot api
  const options = {
    method: "GET",
    url: process.env.RAPID_API_URL + "/fixtures",
    params: {
      league: "39",
      timezone: "America/Los_Angeles",
      from: weekStart,
      to: weekEnd,
      season: now.getFullYear().toString(),
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": process.env.RAPID_API_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    const fixturesArr = response.data.response;

    const supabase = createClient(
      (process.env.SUPABASE_PUBLIC_URL as string) || "",
      (process.env.SUPABASE_ANON_KEY as string) || ""
    );

    //delete all current information
    const { data, error } = await supabase.from("fixtures").delete().neq("id", 0);

    if (error) console.error("Error deleting data: ", error);


    fixturesArr.forEach(async (fixture: any) => {
      const date = new Date(fixture.fixture.timestamp * 1000);
      const hours = date.getHours();
      const minutes = "0" + date.getMinutes();
      const seconds = "0" + date.getSeconds();

      const formattedTime =
        hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

      const { data, error } = await supabase.from("fixtures").insert([
        {
          fixture_id: fixture.fixture.id,
          date: fixture.fixture.date,
          time: formattedTime,
          status: fixture.fixture.status.long,
          home: fixture.teams.home.name,
          home_id: fixture.teams.home.id,
          home_score: fixture.goals.home,
          away: fixture.teams.away.name,
          away_id: fixture.teams.away.id,
          away_score: fixture.goals.away,
          venue: fixture.fixture.venue.name,
        },
      ]);

      if (error) console.error("Error inserting data: ", error);

    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Service Unavailable",
      },
      {
        status: 503,
      }
    );
  }

  return NextResponse.json(
    {
      message: "Updated successfully",
    },
    {
      status: 200,
    }
  );
}
