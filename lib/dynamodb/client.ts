import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const docClient = DynamoDBDocumentClient.from(client);

export const TABLES = {
  BRANDS: process.env.DYNAMODB_BRANDS_TABLE!,
  EVENTS: process.env.DYNAMODB_EVENTS_TABLE!,
  LEGACY: process.env.DYNAMODB_LEGACY_TABLE!,
};
