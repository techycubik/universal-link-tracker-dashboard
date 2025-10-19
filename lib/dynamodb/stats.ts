import { ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";
import { subDays, startOfDay, endOfDay } from "date-fns";

/**
 * Get dashboard overview statistics
 */
export async function getOverviewStats() {
  // Get total brands
  const brandsCommand = new ScanCommand({
    TableName: TABLES.BRANDS,
    ProjectionExpression: "brand",
  });
  const brandsResponse = await docClient.send(brandsCommand);
  const uniqueBrands = new Set(
    brandsResponse.Items?.map((item) => item.brand) || []
  );

  // Get total links
  const linksCommand = new ScanCommand({
    TableName: TABLES.BRANDS,
    Select: "COUNT",
  });
  const linksResponse = await docClient.send(linksCommand);
  const totalLinks = linksResponse.Count || 0;

  // Count active links
  const activeLinksCommand = new ScanCommand({
    TableName: TABLES.BRANDS,
    FilterExpression: "link_status = :status",
    ExpressionAttributeValues: {
      ":status": "active",
    },
    Select: "COUNT",
  });
  const activeLinksResponse = await docClient.send(activeLinksCommand);
  const activeLinks = activeLinksResponse.Count || 0;

  // Get total events (last 30 days for performance)
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30)).toISOString();
  const eventsCommand = new ScanCommand({
    TableName: TABLES.EVENTS,
    FilterExpression: "#ts >= :start",
    ExpressionAttributeNames: {
      "#ts": "timestamp",
    },
    ExpressionAttributeValues: {
      ":start": thirtyDaysAgo,
    },
    Select: "COUNT",
  });
  const eventsResponse = await docClient.send(eventsCommand);
  const totalEvents = eventsResponse.Count || 0;

  // Count click events
  const clicksCommand = new ScanCommand({
    TableName: TABLES.EVENTS,
    FilterExpression: "event_type = :type AND #ts >= :start",
    ExpressionAttributeNames: {
      "#ts": "timestamp",
    },
    ExpressionAttributeValues: {
      ":type": "click",
      ":start": thirtyDaysAgo,
    },
    Select: "COUNT",
  });
  const clicksResponse = await docClient.send(clicksCommand);
  const totalClicks = clicksResponse.Count || 0;

  return {
    totalBrands: uniqueBrands.size,
    totalLinks,
    activeLinks,
    totalEvents,
    totalClicks,
  };
}

/**
 * Get clicks over time (last 30 days)
 */
export async function getClicksOverTime() {
  const days = 30;
  const clicksByDay: Record<string, number> = {};

  // Initialize all days to 0
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    const dateKey = date.toISOString().split("T")[0];
    clicksByDay[dateKey] = 0;
  }

  // Get all click events from last 30 days
  const startDate = startOfDay(subDays(new Date(), days)).toISOString();

  const command = new ScanCommand({
    TableName: TABLES.EVENTS,
    FilterExpression: "event_type = :type AND #ts >= :start",
    ExpressionAttributeNames: {
      "#ts": "timestamp",
    },
    ExpressionAttributeValues: {
      ":type": "click",
      ":start": startDate,
    },
  });

  const response = await docClient.send(command);

  // Count clicks per day
  response.Items?.forEach((event) => {
    const dateKey = event.timestamp.split("T")[0];
    if (clicksByDay[dateKey] !== undefined) {
      clicksByDay[dateKey]++;
    }
  });

  // Convert to array format for charts
  return Object.entries(clicksByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get geographic distribution
 */
export async function getGeographicDistribution() {
  const command = new ScanCommand({
    TableName: TABLES.EVENTS,
    ProjectionExpression: "country, city",
  });

  const response = await docClient.send(command);

  const countryCount: Record<string, number> = {};

  response.Items?.forEach((event) => {
    const country = event.country || "unknown";
    countryCount[country] = (countryCount[country] || 0) + 1;
  });

  return Object.entries(countryCount)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get event type distribution
 */
export async function getEventTypeDistribution() {
  const command = new ScanCommand({
    TableName: TABLES.EVENTS,
    ProjectionExpression: "event_type",
  });

  const response = await docClient.send(command);

  const typeCount: Record<string, number> = {};

  response.Items?.forEach((event) => {
    const type = event.event_type || "unknown";
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.entries(typeCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}
