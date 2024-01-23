---
title: "Building Backend of a Soccer Stats Web App with Next.js, Supabase, and Vercel"
description: "Learn how to create a web app that fetches soccer match data from a third-party API, uploads it to a cloud database using Supabase, and displays the information using Next.js. This tutorial covers setting up accounts with RapidAPI, Supabase, and Vercel, initializing the project, configuring secrets, setting up backend cron jobs, and updating the database with fetched data."
date: "1-17-2024"
---

# Prerequisites

- npm (Node Package Manager, used for managing and installing packages in Node.js)
- HTTP
- React (A JavaScript library for building user interfaces)

# Introduction

This tutorial explains how to create a web app that gathers data from an API. The data is then uploaded into a cloud database. The web app fetches data from the database and displays it.

## 1: Creating Accounts

This project uses the services of [RapidAPI](https://rapidapi.com/hub), [Supabase](https://supabase.com/), and [Vercel](https://vercel.com/). Please create accounts on these three platforms before proceeding.

## 2: Initialize Project

This tutorial uses Next.js. Initialize the project with the following script:

```bash
npx create-next-app@latest --ts --tailwind --use-npm .
```

We will also need to install the Supabase client library and the HTTP client library axios:

```bash
npm i @supabase/supabase-js axios
```

## 3: Setting up Secrets

### RapidAPI

After creating an account with RapidAPI, subscribe to API-FOOTBALL. This API provides an extensive list of statistics from soccer leagues worldwide.

While viewing the API, you'll see a list of endpoints on the left, a list of parameters in the middle, and a code snippet on the right. You'll also see your secrets. Save these secrets in a `.env` file in your workspace.

Create a new file named `.env`. Declare three variables in this file. The URL and host variables should look similar to the ones below. Replace `<Place your secret here>` with your key.

```text
RAPID_API_URL=https://api-football-v1.p.rapidapi.com/v3
RAPID_API_HOST=api-football-v1.p.rapidapi.com
RAPID_API_KEY=<Place your secret here>
```

### Supabase

In the same .env file, create two more secrets for connecting to our database. Go to your Supabase Dashboard and create a new project. Name it anything you want. I'll name mine "soccer-stats".

You'll see a secret titled "Project URL" and another titled "API Key". Copy both and save it in your `.env`. Replace `<Place your secret here>` with your key.

```
SUPABASE_PUBLIC_URL=<Place your secret here>
SUPABASE_ANON_KEY=<Place your secret here>
```

Before we can use our next secret, we must create a table. Select "Table" from the side menu, then "New Table". Name your new table "fixtures" and select "Import data via spreadsheet" next to columns. Then download the following CSV file: [fixtures-sample-data.csv](/blog-assets/1/fixtures-sample-data.csv). Import this data using the "Import data via spreadsheet" at the bottom of the new table configuration. After doing so successfully, you might see a warning saying "Warning: No primary keys selected". Just select the "id" row as the primary column. Afterwards, hit save.

Now that we have created our table we must update our policy to allow a role to read, write, and delete records from our table.

To do so, we must head over to the "Authentication" tab in our side menu. Then you can find the "Policies" tab. Here we can create a new policy via the "New Policy" button. Once clicking it will give you two options. Choose the "For full customization". For the name, we'll name it "allow_anon_all". Choose "All" for allowed operations, make sure you choose "anon" for the target roles, and type "true" for the two code editors. What we are doing here is allowing the "anon" role to have read, write, and delete privileges to the table.

## 3: Setup Backend

### Configure Cron Job

In order to make this web app automatically fetch data, we have to define a cron job. A cron job is a time-based job scheduler. It runs a job periodically at fixed times. The way we create this cron job is to first create a `vercel.json` file in our root directory. This file is used to configure and override default behavior from Vercel within a project. Here we tell Vercel where to find the cron job and when to call it. The following is the `vercel.json` file that I have created for this project.

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 12 * * *"
    }
  ]
}
```

In the above, we tell Vercel that we have a cron job at the path `/api/cron` and to call it every day at 12 pm. Cron job expressions follow the pattern of "Minute Hour Day Month Weekday". The "*" is a wildcard for any time. Digesting our cron expression, "0 12 * * *", we can see that we requested to call our job in the 0th minute at the 12th hour at any day of the month, any month, and any weekday.

**NOTE**: This expression will be processed in UTC timezone.

### Create Cron Job

Now we must create the following directory within our app folder `/api/cron`. Inside this folder, we create a file named `route.ts`.

In our `route.ts` file we are going to import the following:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
```

Now we must create a function to handle GET requests using the following syntax:

```typescript
export async function GET(request: NextRequest){
    // ...
}
```

Soccer matches are set up way more than a week in advance. For this project, we are going to be looking at weekly fixtures. In order to get weekly fixtures, need to specify to our third-party API the time range that we want to gather fixtures from. To do that, we must specify the start and end date as a time range. The following code does just that:

```typescript
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
```

Now we can start setting up our parameters to send a request to our third-party API for information. The following code is a JavaScript Object that will specify the data that we want from the API:

```typescript
const options = {
  method: "GET",
  url: process

.env.RAPID_API_URL + "/fixtures",
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
```

The above says that we want to preform a GET request. The url says that we are targeting the `/fixtures` route. In the params, we are limiting data. We specify that we only want fixtures from league 39. This is the corresponding id to the Premier League. You can find the id of your favorite league at [API-Football's Dashboard](https://dashboard.api-football.com/soccer/ids). What is also worth noting here is that we are using our secrets from RapidAPI in our headers to authenticate ourselves.

At this point, we are ready to send a GET request. To do so, we are going to use our axios library to preform this request:

```typescript
try {
    const response = await axios.request(options);
    const fixturesArr = response.data.response;
    // ...

} catch(error) {
    return NextResponse.json({ message: "Service Unavailable"}, {status: 503})
}
```

If we create a breakpoint at `fixturesArr` and see what's inside of the array we would see a list of fixtures. Each fixture would have a lot of robust details such as venue, referees, periods, etc.

At this point of the tutorial I would like you to confirm that at least fixtures array is populated before moving forward.

After receiving the data what I would like to do is push this data in our fixtures table that we created in our Supabase dashboard. A good question to ask here is "Why are we getting data from the API then uploading this data into to a database?". The answer here is cost-effectiveness. There is a limit to how many calls you can make to our football API until you are charged for every request. However there is not limit to how many calls we make to our database. Because of this we are making a cron job that will fetch data from the football API then push that data into a database which we will use to populate our website.

Now that we have te `fixturesArr` we can start updating our database with our fixtures.

inside our exception handling we will start a connection to our database and use our `fixturesArr` to insert data into our fixtures table

```typescript
try{
    ...

    const supabase = createClient(
      (process.env.SUPABASE_PUBLIC_URL as string) || "",
      (process.env.SUPABASE_ANON_KEY as string) || ""
    );

} catch (error) {
    ...
}
```

At this point we must check that our supabase client does return a connection. Please check that before proceeding.

Next we execute a delete operation to clear our our database of old data before proceeding to insert new data. If any errors are caught at this point then we make sure to throw them. 

```typescript
const { data, error } = await supabase.from("fixtures").delete().neq("id", 0);

if (error) throw error;
```

After establishing a connection with our database then can we actually insert data. For this we must iterate through every fixture in `fixtureArr`. Alternatively we can insert all fixtures in one operation but we are iterating through every fixture to formate the dates.

Below does just that

```typescript
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
```

If done successfully we can go back to our Supabase dashboard and see it populated.

The last step here is to return a response after our exception handling block to make sure we practice proper RESTful guidlines.

```typescript
return NextResponse.json({ message: "Updated database successfully" }, {status: 200});
```

Lastly we should write the following authorization code to only allow api calls from authorized actors. Such as calls from our internal server. If we did not write this segment, then anyone who calls our `/api/cron` route will be able to update our database without permission!

Please write the following at the top of the function.

```javascript
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

    ...
}
```

In the code above we check for a header called "authorization". This header will be automatically generated by our host Vercel when they execute a cron job that we defined earlier.

We also need to add a environment variable named "CRON_SECRET". You can use However, this will only be necessary when configuring environment variables within the Vercel project dashboard. You can generate a random string to use as a secret in your terminal using the following command.

```bash
openssl rand -base64 16
```

At this point we should have a fully functioning automatic data fetching system.

The rest is to create a dynamic user-friendly UI, but I will leave the creative part to you. For inspiration feel free to checkout my version of this app at [Soccer-Stats-Two](https://soccer-stats-two.vercel.app)

Once finished upload your work to Vercel and configure your environment variable in the dashboard.