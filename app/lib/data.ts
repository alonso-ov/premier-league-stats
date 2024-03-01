import { Client } from "pg";
import { promises as fs } from "fs";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const SECRET_NAME = "soccer-stats-auth";
const CERT_FILE_PATH = process.cwd() + "/certification/global-bundle.pem";

async function fetchSecret() {
  try {
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
    return JSON.parse(secretString);
  } catch (error) {
    console.error("fetchSecret error: ", error);
    throw new Error("Failed to fetch secret from AWS Secrets Manager");
  }
}

interface secretsObjectType {
  host: string,
  port: string,
  username: string,
  password: string
}


async function connectToDatabase(secretObj: secretsObjectType) {
  try {
    const caCert = await fs.readFile(CERT_FILE_PATH, "utf8");

    const client = new Client({
      host: secretObj.host,
      port: secretObj.port,
      user: secretObj.username,
      password: secretObj.password,
      database: "postgres",
      ssl: {
        sslmode: "require",
        ca: caCert,
      },
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error("connectToDatabase error: ", error);
    throw new Error("Failed to connect to the database");
  }
}

export async function getFixtures() {
  try {
    const secretObj = await fetchSecret();
    const client = await connectToDatabase(secretObj);

    const result = await client.query("SELECT * FROM public.fixtures");
    const fixturesData = result.rows;

    await client.end();

    return fixturesData;
  } catch (error) {
    console.error("getFixtures error: ", error);
    throw new Error("Failed to get fixtures from Supabase");
  }
}
