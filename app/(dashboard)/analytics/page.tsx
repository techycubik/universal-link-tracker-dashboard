"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Globe,
  Clock,
  MapPin,
  Users,
  Activity,
  MousePointer,
  Eye,
} from "lucide-react";

export default function AnalyticsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [groupBy, setGroupBy] = useState<"tracking_id" | "visitor_ip">(
    "tracking_id"
  );

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", page, pageSize, groupBy],
    queryFn: async () => {
      const res = await fetch(
        `/api/events/sessions?limit=${pageSize}&page=${page}&groupBy=${groupBy}`
      );
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

  // Get all data for stats calculation
  const { data: allData } = useQuery({
    queryKey: ["all-sessions"],
    queryFn: async () => {
      const res = await fetch(`/api/events/sessions?limit=1000&page=1`);
      if (!res.ok) throw new Error("Failed to fetch all sessions");
      return res.json();
    },
  });

  const sessions = data?.sessions || [];
  const visitors = data?.visitors || [];
  const total = data?.total || 0;

  const totalPages = Math.ceil(total / pageSize);

  // Calculate unique visitors from all sessions
  const uniqueVisitors = allData?.sessions
    ? new Set(allData.sessions.map((s: any) => s.visitor_ip).filter(Boolean))
        .size
    : 0;

  // Calculate total events from all sessions
  const totalEvents = allData?.sessions
    ? allData.sessions.reduce((sum: number, s: any) => sum + s.event_count, 0)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            View detailed analytics and user sessions
          </p>
        </div>
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          View detailed analytics and user sessions grouped by tracking ID or
          visitor IP
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allData?.sessions?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">Based on visitor IP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(allData?.sessions?.map((s: any) => s.country)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={groupBy}
        onValueChange={(value) =>
          setGroupBy(value as "tracking_id" | "visitor_ip")
        }
      >
        <TabsList>
          <TabsTrigger value="tracking_id">By Tracking Session</TabsTrigger>
          <TabsTrigger value="visitor_ip">By Visitor IP</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking_id" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions by Tracking ID</CardTitle>
              <CardDescription>
                View sessions grouped by unique tracking identifiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {sessions.map((session: any, index: number) => (
                  <AccordionItem
                    key={session.tracking_id}
                    value={`session-${index}`}
                  >
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">
                              {session.tracking_id.slice(0, 24)}...
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.brand} • {session.event_count} events
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{session.country}</Badge>
                          <Badge variant="outline">{session.city}</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">First Event</p>
                            <p className="text-muted-foreground">
                              {new Date(session.first_event).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Last Event</p>
                            <p className="text-muted-foreground">
                              {new Date(session.last_event).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-muted-foreground">
                              {Math.round(
                                (new Date(session.last_event).getTime() -
                                  new Date(session.first_event).getTime()) /
                                  1000
                              )}
                              s
                            </p>
                          </div>
                          {/* <div>
                            <p className="font-medium">Visitor IP</p>
                            <p className="text-muted-foreground text-xs">
                              {session.visitor_ip || "Unknown"}
                            </p>
                          </div> */}
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-muted-foreground text-xs">
                              {session.city}, {session.country}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">User Agent</p>
                            <p className="text-muted-foreground text-xs">
                              {session.user_agent.slice(0, 50)}...
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Events Timeline</p>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {session.events?.map(
                              (event: any, eventIndex: number) => {
                                const uniqueIPs = new Set(
                                  session.events.map((e: any) => e.visitor_ip)
                                );
                                const ipArray = Array.from(uniqueIPs);
                                const ipIndex = ipArray.indexOf(
                                  event.visitor_ip
                                );
                                const borderColors = [
                                  "border-blue-500",
                                  "border-green-500",
                                  "border-purple-500",
                                  "border-orange-500",
                                  "border-pink-500",
                                ];
                                const badgeColors = [
                                  "bg-blue-100 text-blue-800",
                                  "bg-green-100 text-green-800",
                                  "bg-purple-100 text-purple-800",
                                  "bg-orange-100 text-orange-800",
                                  "bg-pink-100 text-pink-800",
                                ];
                                const borderColor =
                                  borderColors[ipIndex % borderColors.length];
                                const badgeColor =
                                  badgeColors[ipIndex % badgeColors.length];

                                return (
                                  <div
                                    key={eventIndex}
                                    className={`border-l-2 ${borderColor} pl-4 py-2`}
                                  >
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <Badge variant="secondary">
                                        {event.event_type}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(
                                          event.timestamp
                                        ).toLocaleTimeString()}
                                      </span>
                                      {event.visitor_ip && (
                                        <Badge
                                          variant="outline"
                                          className={`text-xs font-mono ${badgeColor}`}
                                        >
                                          {event.visitor_ip.includes(":")
                                            ? `...${event.visitor_ip.slice(
                                                -12
                                              )}`
                                            : event.visitor_ip}
                                        </Badge>
                                      )}
                                    </div>

                                    {event.page_title && (
                                      <p className="text-sm font-medium">
                                        {event.page_title}
                                      </p>
                                    )}

                                    {event.url && (
                                      <p className="text-xs text-muted-foreground">
                                        {event.url}
                                      </p>
                                    )}

                                    {event.event_type === "click" && (
                                      <div className="mt-2 text-xs space-y-1">
                                        {event.element_text && (
                                          <p>
                                            <span className="font-medium">
                                              Clicked:
                                            </span>{" "}
                                            {event.element_text}
                                          </p>
                                        )}
                                        {event.button_text && (
                                          <p>
                                            <span className="font-medium">
                                              Button:
                                            </span>{" "}
                                            {event.button_text}
                                          </p>
                                        )}
                                        {event.link_href && (
                                          <p>
                                            <span className="font-medium">
                                              Link:
                                            </span>{" "}
                                            {event.link_href}
                                          </p>
                                        )}
                                        {event.click_x && event.click_y && (
                                          <p>
                                            <span className="font-medium">
                                              Position:
                                            </span>{" "}
                                            ({event.click_x}, {event.click_y})
                                          </p>
                                        )}
                                        {event.is_external === "true" && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            External Link
                                          </Badge>
                                        )}
                                      </div>
                                    )}

                                    {event.event_type ===
                                      "scroll_milestone" && (
                                      <div className="mt-2 text-xs">
                                        <p>
                                          <span className="font-medium">
                                            Scroll Depth:
                                          </span>{" "}
                                          {event.depth_percent}%
                                        </p>
                                        {event.scroll_pixels && (
                                          <p>
                                            <span className="font-medium">
                                              Pixels:
                                            </span>{" "}
                                            {event.scroll_pixels}px
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {event.referrer &&
                                      event.referrer !== "" && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          <span className="font-medium">
                                            Referrer:
                                          </span>{" "}
                                          {event.referrer}
                                        </p>
                                      )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No sessions found
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Analytics data will appear here once users start interacting
                    with your links
                  </p>
                </div>
              )}

              {sessions.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={total}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(1);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitor_ip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions by Visitor IP</CardTitle>
              <CardDescription>
                View all activity grouped by unique visitor IP addresses to see
                individual user behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {visitors.map((visitor: any, index: number) => (
                  <AccordionItem
                    key={visitor.visitor_ip}
                    value={`visitor-${index}`}
                  >
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium font-mono">
                              {visitor.visitor_ip}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {visitor.total_events} events •{" "}
                              {visitor.tracking_ids.length} session(s) •{" "}
                              {visitor.brands.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{visitor.country}</Badge>
                          <Badge variant="outline">{visitor.city}</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">First Seen</p>
                            <p className="text-muted-foreground">
                              {new Date(visitor.first_seen).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Last Seen</p>
                            <p className="text-muted-foreground">
                              {new Date(visitor.last_seen).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Total Time</p>
                            <p className="text-muted-foreground">
                              {Math.round(
                                (new Date(visitor.last_seen).getTime() -
                                  new Date(visitor.first_seen).getTime()) /
                                  1000
                              )}
                              s
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-muted-foreground">
                              {visitor.city}, {visitor.region},{" "}
                              {visitor.country}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Tracking IDs</p>
                            <p className="text-muted-foreground text-xs">
                              {visitor.tracking_ids.length} unique session(s)
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Brands</p>
                            <p className="text-muted-foreground text-xs">
                              {visitor.brands.join(", ")}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium mb-2">
                            Complete Activity Timeline ({visitor.total_events}{" "}
                            events)
                          </p>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {visitor.events?.map(
                              (event: any, eventIndex: number) => (
                                <div
                                  key={eventIndex}
                                  className="border-l-2 border-green-500 pl-4 py-2"
                                >
                                  <div className="flex items-center gap-3 mb-1">
                                    <Badge variant="secondary">
                                      {event.event_type}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(
                                        event.timestamp
                                      ).toLocaleString()}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {event.tracking_id.slice(0, 8)}...
                                    </Badge>
                                  </div>

                                  {event.page_title && (
                                    <p className="text-sm font-medium">
                                      {event.page_title}
                                    </p>
                                  )}

                                  {event.url && (
                                    <p className="text-xs text-muted-foreground">
                                      {event.url}
                                    </p>
                                  )}

                                  {event.event_type === "click" && (
                                    <div className="mt-2 text-xs space-y-1">
                                      {event.element_text && (
                                        <p>
                                          <span className="font-medium">
                                            Clicked:
                                          </span>{" "}
                                          {event.element_text}
                                        </p>
                                      )}
                                      {event.button_text && (
                                        <p>
                                          <span className="font-medium">
                                            Button:
                                          </span>{" "}
                                          {event.button_text}
                                        </p>
                                      )}
                                      {event.link_href && (
                                        <p>
                                          <span className="font-medium">
                                            Link:
                                          </span>{" "}
                                          {event.link_href}
                                        </p>
                                      )}
                                      {event.click_x && event.click_y && (
                                        <p>
                                          <span className="font-medium">
                                            Position:
                                          </span>{" "}
                                          ({event.click_x}, {event.click_y})
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {event.event_type === "scroll_milestone" && (
                                    <div className="mt-2 text-xs">
                                      <p>
                                        <span className="font-medium">
                                          Scroll Depth:
                                        </span>{" "}
                                        {event.depth_percent}%
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="font-medium mb-2">
                            Session IDs Used by This Visitor
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {visitor.tracking_ids.map((tid: string) => (
                              <Badge key={tid} variant="outline">
                                {tid.slice(0, 16)}...
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {visitors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No visitors found
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Visitor data will appear here once users start interacting
                    with your links
                  </p>
                </div>
              )}

              {visitors.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={total}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(1);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
