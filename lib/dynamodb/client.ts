import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// AWS Amplify blocks AWS_* prefixed env vars, so we use CUSTOM_AWS_* prefix
// Supports both explicit credentials (local dev, Docker) and IAM roles (Amplify, ECS)
const config: DynamoDBClientConfig = {
  region: process.env.CUSTOM_AWS_REGION || process.env.AWS_REGION || "us-east-2",
};

// Only add explicit credentials if provided (for local development, Docker, etc.)
// If not provided, AWS SDK will automatically use IAM role credentials (Amplify, ECS, Lambda)
if (process.env.CUSTOM_AWS_ACCESS_KEY_ID && process.env.CUSTOM_AWS_SECRET_ACCESS_KEY) {
  config.credentials = {
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
  };
} else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  // Fallback to AWS_* prefixed vars (for backwards compatibility in non-Amplify environments)
  config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const client = new DynamoDBClient(config);

export const docClient = DynamoDBDocumentClient.from(client);

export const TABLES = {
  BRANDS: process.env.DYNAMODB_BRANDS_TABLE!,
  EVENTS: process.env.DYNAMODB_EVENTS_TABLE!,
  LEGACY: process.env.DYNAMODB_LEGACY_TABLE!,
};
