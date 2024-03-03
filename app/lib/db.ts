import { Client } from "pg";
import { promises as fs } from "fs";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const SECRET_NAME = "soccer-stats-db-readonly";
const CERT_FILE_PATH = process.cwd() + "/certification/global-bundle.pem";

export async function fetchSecret() {
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


export async function connectToDatabase() {
  
  try {
    const secretObj: secretsObjectType = await fetchSecret();
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