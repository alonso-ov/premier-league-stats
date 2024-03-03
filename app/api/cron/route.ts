import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";
import { promises as fs } from "fs";
import { connectToDatabase } from "@/app/lib/db";
import jwt from "jsonwebtoken";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

async function verifyToken(token: string) {

  const SECRET_NAME = "soccer-stats-apiKey";

  const secretsClient = new SecretsManagerClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });

  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: SECRET_NAME,
      VersionStage: "AWSCURRENT",
    })
  );

  const secretString = response.SecretString || "";
  const secretObj = JSON.parse(secretString);
  const secretKey = secretObj.secretKey;

  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err: any) => {
      if (err) {
        reject(err);
      }

      resolve(null)
    });
  });
}

export async function GET(request: NextRequest) {

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.split(" ")[1]; // Formatted "Bearer <token>"

  try{
    await verifyToken(token);
  } catch(error) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
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

  const currentYear = new Date().getFullYear();

  let seasonYear = currentYear;

  // season starts in August and ends in May, if the current month is less than 7, then the season year is the previous year
  if (now.getMonth() < 7) {
    seasonYear = now.getFullYear() - 1;
  }

  //get most recent data from foot api
  const options = {
    method: "GET",
    url: process.env.RAPID_API_URL + "/fixtures",
    params: {
      league: "39",
      timezone: "America/Los_Angeles",
      from: weekStart,
      to: weekEnd,
      season: seasonYear, // This year is always the year that the season starts (e.g 2020-2021 season is 2020)
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": process.env.RAPID_API_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    const fixturesArr = response.data.response;

    // retrieve the SSL certificate
    const caCert = await fs.readFile(
      process.cwd() + "/certification/global-bundle.pem",
      "utf8",
    );

    //create client, by default, SSL is enabled
    const client = await connectToDatabase();

    // Delete all rows from the 'fixtures' table
    const deleteQuery = "DELETE FROM fixtures";
    await client.query(deleteQuery);

    fixturesArr.forEach(async (fixture: any) => {
      const date = new Date(fixture.fixture.timestamp * 1000);
      const hours = date.getHours();
      const minutes = "0" + date.getMinutes();
      const seconds = "0" + date.getSeconds();

      const formattedTime =
        hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

      const insertQuery = `
              INSERT INTO fixtures (
                fixture_id, date, time, status, home, home_id, home_score,
                away, away_id, away_score, venue
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
              )`;

      const values = [
        fixture.fixture.id,
        fixture.fixture.date,
        formattedTime,
        fixture.fixture.status.long,
        fixture.teams.home.name,
        fixture.teams.home.id,
        fixture.goals.home,
        fixture.teams.away.name,
        fixture.teams.away.id,
        fixture.goals.away,
        fixture.fixture.venue.name,
      ];

      try {
        await client.query(insertQuery, values);
      } catch (error) {
        console.error("Error inserting data into the database", error);
        throw error;
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Service Unavailable",
      },
      {
        status: 503,
      },
    );
  }

  return NextResponse.json(
    {
      message: "Updated successfully",
    },
    {
      status: 200,
    },
  );
}
