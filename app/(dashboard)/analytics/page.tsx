"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BarChart3, Globe, Clock, MapPin } from "lucide-react";

export default function AnalyticsPage() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await fetch("/api/events/sessions?limit=20");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

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
          View detailed analytics and user sessions
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
            <div className="text-2xl font-bold">{sessions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.reduce(
                (sum: number, session: any) => sum + session.event_count,
                0
              ) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(sessions?.map((s: any) => s.country)).size || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(sessions?.map((s: any) => s.brand)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Latest user sessions with detailed event tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {sessions?.slice(0, 10).map((session: any, index: number) => (
              <AccordionItem
                key={session.tracking_id}
                value={`session-${index}`}
              >
                <AccordionTrigger className="text-left">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          Session {session.tracking_id.slice(0, 8)}...
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                        <p className="font-medium">User Agent</p>
                        <p className="text-muted-foreground text-xs">
                          {session.user_agent.slice(0, 100)}...
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
                    </div>
                    <div>
                      <p className="font-medium mb-2">Events Timeline</p>
                      <div className="space-y-2">
                        {session.events
                          ?.slice(0, 5)
                          .map((event: any, eventIndex: number) => (
                            <div
                              key={eventIndex}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium">
                                {event.event_type}
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                              {event.url && (
                                <span className="text-muted-foreground text-xs">
                                  {event.url.slice(0, 50)}...
                                </span>
                              )}
                            </div>
                          ))}
                        {session.events?.length > 5 && (
                          <p className="text-sm text-muted-foreground">
                            ... and {session.events.length - 5} more events
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {sessions?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analytics data</h3>
            <p className="text-muted-foreground text-center">
              Analytics data will appear here once users start interacting with
              your links
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
