"use client";

import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Link as LinkIcon,
  MousePointer,
  Activity,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["overview-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats/overview");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your link tracking analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Brands"
          value={stats?.totalBrands || 0}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Links"
          value={stats?.totalLinks || 0}
          icon={LinkIcon}
        />
        <StatsCard
          title="Active Links"
          value={stats?.activeLinks || 0}
          icon={Activity}
        />
        <StatsCard
          title="Total Clicks"
          value={stats?.totalClicks || 0}
          icon={MousePointer}
        />
      </div>

      {/* Add more charts and widgets here */}
    </div>
  );
}
