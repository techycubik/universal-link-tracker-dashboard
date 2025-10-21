import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "./client";
import { AnalyticsEvent, EventSession, VisitorSession } from "@/types/event";

/**
 * Get all events for a specific tracking session
 */
export async function getSessionEvents(
  trackingId: string
): Promise<AnalyticsEvent[]> {
  const command = new QueryCommand({
    TableName: TABLES.EVENTS,
    KeyConditionExpression: "tracking_id = :tid",
    ExpressionAttributeValues: {
      ":tid": trackingId,
    },
    ScanIndexForward: true, // Chronological order
  });

  const response = await docClient.send(command);
  return (response.Items || []) as AnalyticsEvent[];
}

/**
 * Get all unique sessions (grouped by tracking_id)
 */
export async function getAllSessions(
  limit = 100,
  offset = 0
): Promise<{ sessions: EventSession[]; total: number }> {
  // First get recent tracking_ids
  const command = new ScanCommand({
    TableName: TABLES.EVENTS,
    Limit: 1000, // Get a large sample to find unique sessions
  });

  const response = await docClient.send(command);
  const items = response.Items || [];

  // Group by tracking_id
  const sessionsMap = new Map<string, AnalyticsEvent[]>();

  items.forEach((event) => {
    const tid = event.tracking_id;
    if (!sessionsMap.has(tid)) {
      sessionsMap.set(tid, []);
    }
    sessionsMap.get(tid)!.push(event as AnalyticsEvent);
  });

  // Convert to EventSession array
  const sessions: EventSession[] = Array.from(sessionsMap.entries()).map(
    ([tracking_id, events]) => {
      events.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];

      return {
        tracking_id,
        brand: firstEvent.brand,
        event_count: events.length,
        first_event: firstEvent.timestamp,
        last_event: lastEvent.timestamp,
        country: firstEvent.country,
        city: firstEvent.city,
        user_agent: firstEvent.user_agent,
        visitor_ip: firstEvent.visitor_ip,
        events,
      };
    }
  );

  // Sort by most recent
  sessions.sort(
    (a, b) =>
      new Date(b.first_event).getTime() - new Date(a.first_event).getTime()
  );

  const total = sessions.length;
  const paginatedSessions = sessions.slice(offset, offset + limit);

  return {
    sessions: paginatedSessions,
    total,
  };
}

/**
 * Get sessions grouped by visitor IP
 */
export async function getSessionsByVisitorIP(
  limit = 100,
  offset = 0
): Promise<{ visitors: VisitorSession[]; total: number }> {
  const command = new ScanCommand({
    TableName: TABLES.EVENTS,
    Limit: 1000,
  });

  const response = await docClient.send(command);
  const items = response.Items || [];

  // Group by visitor_ip
  const visitorsMap = new Map<string, AnalyticsEvent[]>();

  items.forEach((event) => {
    const ip = event.visitor_ip;
    if (ip) {
      if (!visitorsMap.has(ip)) {
        visitorsMap.set(ip, []);
      }
      visitorsMap.get(ip)!.push(event as AnalyticsEvent);
    }
  });

  // Convert to VisitorSession array
  const visitors: VisitorSession[] = Array.from(visitorsMap.entries()).map(
    ([visitor_ip, events]) => {
      events.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];

      const uniqueTrackingIds = [...new Set(events.map((e) => e.tracking_id))];
      const uniqueBrands = [...new Set(events.map((e) => e.brand))];

      return {
        visitor_ip,
        total_events: events.length,
        tracking_ids: uniqueTrackingIds,
        brands: uniqueBrands,
        first_seen: firstEvent.timestamp,
        last_seen: lastEvent.timestamp,
        country: firstEvent.country,
        city: firstEvent.city,
        region: firstEvent.region,
        events,
      };
    }
  );

  // Sort by most events
  visitors.sort((a, b) => b.total_events - a.total_events);

  const total = visitors.length;
  const paginatedVisitors = visitors.slice(offset, offset + limit);

  return {
    visitors: paginatedVisitors,
    total,
  };
}

/**
 * Get events by brand
 */
export async function getEventsByBrand(
  brand: string,
  limit = 100
): Promise<AnalyticsEvent[]> {
  const command = new QueryCommand({
    TableName: TABLES.EVENTS,
    IndexName: "brand-timestamp-index",
    KeyConditionExpression: "brand = :brand",
    ExpressionAttributeValues: {
      ":brand": brand,
    },
    Limit: limit,
    ScanIndexForward: false, // Most recent first
  });

  const response = await docClient.send(command);
  return (response.Items || []) as AnalyticsEvent[];
}

/**
 * Get events by link UUID
 */
export async function getEventsByLink(
  linkUuid: string,
  limit = 100
): Promise<AnalyticsEvent[]> {
  const command = new QueryCommand({
    TableName: TABLES.EVENTS,
    IndexName: "link_uuid-timestamp-index",
    KeyConditionExpression: "link_uuid = :uuid",
    ExpressionAttributeValues: {
      ":uuid": linkUuid,
    },
    Limit: limit,
    ScanIndexForward: false,
  });

  const response = await docClient.send(command);
  return (response.Items || []) as AnalyticsEvent[];
}
