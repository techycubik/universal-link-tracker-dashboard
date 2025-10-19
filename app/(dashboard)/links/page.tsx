"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, ExternalLink, Copy } from "lucide-react";
import { CreateLinkDialog } from "@/components/links/create-link-dialog";

export default function LinksPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      if (!res.ok) throw new Error("Failed to fetch brands");
      return res.json();
    },
  });

  // Fetch all links from API
  const { data: linksData, isLoading: linksLoading } = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to fetch links");
      return res.json();
    },
  });

  if (isLoading || linksLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Links</h2>
            <p className="text-muted-foreground">
              Manage your tracked links and view performance
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Link
          </Button>
        </div>
        <div>Loading links...</div>
      </div>
    );
  }

  // Use real links data or fallback to empty array
  const allLinks = linksData || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Links</h2>
            <p className="text-muted-foreground">
              Manage your tracked links and view performance
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Link
          </Button>
        </div>

      <div className="space-y-4">
        {allLinks.map((link: any) => (
          <Card key={link.UUID || link.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <LinkIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {link.short_url || link.shortUrl || "No short URL"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        → {link.real_url || link.realUrl || "No target URL"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Brand: {link.brand}</span>
                    {link.campaign_id && (
                      <>
                        <span>•</span>
                        <span>Campaign: {link.campaign_id}</span>
                      </>
                    )}
                    {link.source && (
                      <>
                        <span>•</span>
                        <span>Source: {link.source}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      Created{" "}
                      {new Date(link.created_at || link.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      link.link_status === "active" || link.status === "active"
                        ? "default"
                        : link.link_status === "inactive" || link.status === "inactive"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {link.link_status || link.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.short_url || link.shortUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(link.short_url || link.shortUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allLinks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No links found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first tracked link to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          </CardContent>
        </Card>
      )}
      </div>

      <CreateLinkDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
