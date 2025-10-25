import {
  QueryCommand,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";
import { BrandLink } from "@/types/brand";

/**
 * Get all brands (unique brands from brands table)
 */
export async function getAllBrands(): Promise<string[]> {
  const command = new ScanCommand({
    TableName: TABLES.BRANDS,
    ProjectionExpression: "brand",
  });

  const response = await docClient.send(command);
  const brands = new Set<string>();

  response.Items?.forEach((item) => {
    if (item.brand) brands.add(item.brand);
  });

  return Array.from(brands);
}

/**
 * Get all links for a specific brand
 */
export async function getBrandLinks(brand: string): Promise<BrandLink[]> {
  const command = new QueryCommand({
    TableName: TABLES.BRANDS,
    KeyConditionExpression: "brand = :brand",
    ExpressionAttributeValues: {
      ":brand": brand,
    },
  });

  const response = await docClient.send(command);
  return (response.Items || []) as BrandLink[];
}

/**
 * Get a specific link by brand and UUID
 */
export async function getBrandLink(
  brand: string,
  uuid: string
): Promise<BrandLink | null> {
  const command = new GetCommand({
    TableName: TABLES.BRANDS,
    Key: {
      brand,
      UUID: uuid,
    },
  });

  const response = await docClient.send(command);
  return (response.Item as BrandLink) || null;
}

/**
 * Parse rate limit headers from response
 */
function parseRateLimitHeaders(response: Response): {
  limit: number | null;
  remaining: number | null;
  retryAfter: number | null;
} {
  return {
    limit: response.headers.get("X-RateLimit-Limit")
      ? parseInt(response.headers.get("X-RateLimit-Limit")!)
      : null,
    remaining: response.headers.get("X-RateLimit-Remaining")
      ? parseInt(response.headers.get("X-RateLimit-Remaining")!)
      : null,
    retryAfter: response.headers.get("Retry-After")
      ? parseInt(response.headers.get("Retry-After")!)
      : null,
  };
}

/**
 * Create a new brand link (via API Gateway)
 */
export async function createBrandLink(data: {
  real_url: string;
  brand: string;
  created_by: string;
  campaign_id?: string;
  source?: string;
  metadata?: any;
}): Promise<BrandLink> {
  const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  const apiKey = process.env.LINK_TRACKER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "API key not configured. Please set LINK_TRACKER_API_KEY environment variable."
    );
  }

  const response = await fetch(`${apiUrl}/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(data),
  });

  // Handle authentication errors (403)
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        "Invalid or missing API key. Please check your configuration."
    );
  }

  // Handle rate limiting errors (429)
  if (response.status === 429) {
    const rateLimitInfo = parseRateLimitHeaders(response);
    const errorData = await response.json().catch(() => ({}));

    const retryMessage = rateLimitInfo.retryAfter
      ? ` Please try again in ${rateLimitInfo.retryAfter} seconds.`
      : " Please try again later.";

    throw new Error(
      errorData.message ||
        `Rate limit exceeded.${retryMessage}` ||
        "Too many requests. Please try again later.",
      { cause: { code: 429, retryAfter: rateLimitInfo.retryAfter } } as any
    );
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || "Failed to create link"
    );
  }

  return response.json();
}

/**
 * Delete a brand link
 */
export async function deleteBrandLink(
  brand: string,
  uuid: string
): Promise<void> {
  const command = new DeleteCommand({
    TableName: TABLES.BRANDS,
    Key: {
      brand,
      UUID: uuid,
    },
  });

  await docClient.send(command);
}

/**
 * Create a new brand (by creating a placeholder entry)
 * Note: Brands are implicitly created when links are added, but this
 * creates a placeholder entry to explicitly register the brand.
 */
export async function createBrand(brandName: string): Promise<void> {
  // Create a placeholder entry to register the brand
  // This ensures the brand appears in getAllBrands() even with 0 links
  const command = new PutCommand({
    TableName: TABLES.BRANDS,
    Item: {
      brand: brandName,
      UUID: "_placeholder",
      created_at: new Date().toISOString(),
      created_by: "dashboard",
      real_url: "",
      short_url: "",
      link_status: "inactive",
      metadata: {
        placeholder: true,
        description: "Brand placeholder entry",
      },
    },
    ConditionExpression: "attribute_not_exists(brand) AND attribute_not_exists(#uuid)",
    ExpressionAttributeNames: {
      "#uuid": "UUID",
    },
  });

  try {
    await docClient.send(command);
  } catch (error: any) {
    // If conditional check fails, brand already exists
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("Brand already exists");
    }
    throw error;
  }
}

/**
 * Get brand statistics
 */
export async function getBrandStats(brand: string) {
  // Get total links
  const links = await getBrandLinks(brand);

  // Filter out placeholder entries and count active/inactive/expired
  const realLinks = links.filter((link) => link.UUID !== "_placeholder");

  const stats = realLinks.reduce(
    (acc, link) => {
      acc.total++;
      if (link.link_status === "active") acc.active++;
      else if (link.link_status === "inactive") acc.inactive++;
      else if (link.link_status === "expired") acc.expired++;
      return acc;
    },
    { total: 0, active: 0, inactive: 0, expired: 0 }
  );

  return stats;
}
