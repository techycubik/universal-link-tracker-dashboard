"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Copy, Check } from "lucide-react";

const linkSchema = z.object({
  real_url: z.string().url("Must be a valid URL"),
  brand: z.string().min(1, "Brand is required"),
  created_by: z.string().min(1, "Created by is required"),
  campaign_id: z.string().optional(),
  source: z.string().optional(),
  metadata: z.string().optional(), // JSON string
});

type LinkFormData = z.infer<typeof linkSchema>;

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultBrand?: string;
}

const SOURCE_OPTIONS = [
  { value: "social-media", label: "Social Media" },
  { value: "email", label: "Email" },
  { value: "paid-ads", label: "Paid Ads" },
  { value: "organic", label: "Organic" },
  { value: "referral", label: "Referral" },
  { value: "direct", label: "Direct" },
  { value: "other", label: "Other" },
];

export function CreateLinkDialog({
  open,
  onOpenChange,
  defaultBrand,
}: CreateLinkDialogProps) {
  const queryClient = useQueryClient();
  const [createdShortUrl, setCreatedShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      brand: defaultBrand || "",
      created_by: "dashboard-user", // TODO: Get from auth context
      source: "direct",
    },
  });

  // Fetch existing brands for dropdown
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      if (!res.ok) throw new Error("Failed to fetch brands");
      return res.json();
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: LinkFormData) => {
      // Parse metadata if provided
      let parsedMetadata = undefined;
      if (data.metadata) {
        try {
          parsedMetadata = JSON.parse(data.metadata);
        } catch (e) {
          throw new Error("Invalid JSON in metadata field");
        }
      }

      const payload = {
        real_url: data.real_url,
        brand: data.brand,
        created_by: data.created_by,
        campaign_id: data.campaign_id || undefined,
        source: data.source || undefined,
        metadata: parsedMetadata,
      };

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();

        // Handle authentication errors (403)
        if (res.status === 403) {
          throw new Error(
            error.message ||
              "Invalid or missing API key. Please contact your administrator."
          );
        }

        // Handle rate limiting errors (429)
        if (res.status === 429) {
          const retryAfter = error.retryAfter || res.headers.get("Retry-After");
          const retryMessage = retryAfter
            ? ` Please try again in ${retryAfter} seconds.`
            : " Please try again later.";

          throw new Error(
            error.message || `Rate limit exceeded.${retryMessage}`,
            { cause: { code: 429, retryAfter } } as any
          );
        }

        // Generic error
        throw new Error(
          error.message || error.error || "Failed to create link"
        );
      }

      return res.json();
    },
    onSuccess: (data) => {
      setCreatedShortUrl(data.short_url || data.tracking_url || "Link created!");
      toast.success("Link created successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
    onError: (error: Error) => {
      const errorCause = (error as any).cause;

      // Show specific error message for rate limiting
      if (errorCause?.code === 429) {
        const retryAfter = errorCause.retryAfter;
        if (retryAfter) {
          toast.error(error.message, {
            duration: retryAfter * 1000, // Show for duration of retry period
          });
        } else {
          toast.error(error.message);
        }
      } else {
        // Show generic error
        toast.error(error.message || "Failed to create link");
      }
    },
  });

  const onSubmit = (data: LinkFormData) => {
    createLinkMutation.mutate(data);
  };

  const handleClose = () => {
    if (!createLinkMutation.isPending) {
      reset();
      setCreatedShortUrl(null);
      setCopied(false);
      onOpenChange(false);
    }
  };

  const handleCopyUrl = () => {
    if (createdShortUrl) {
      navigator.clipboard.writeText(createdShortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedSource = watch("source");

  // If link was created successfully, show success view
  if (createdShortUrl) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Created Successfully! 🎉</DialogTitle>
            <DialogDescription>
              Your tracked link has been generated and is ready to use.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Your Short URL
              </Label>
              <div className="flex items-center gap-2">
                <Input value={createdShortUrl} readOnly className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Tracked Link</DialogTitle>
          <DialogDescription>
            Create a new tracked link with campaign information and metadata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Real URL */}
            <div className="space-y-2">
              <Label htmlFor="real_url">
                Target URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="real_url"
                type="url"
                placeholder="https://example.com/page"
                {...register("real_url")}
                disabled={createLinkMutation.isPending}
              />
              {errors.real_url && (
                <p className="text-sm text-destructive">{errors.real_url.message}</p>
              )}
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">
                Brand <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("brand")}
                onValueChange={(value) => setValue("brand", value)}
                disabled={createLinkMutation.isPending || !!defaultBrand}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands?.map((brand: any) => (
                    <SelectItem key={brand.name} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand && (
                <p className="text-sm text-destructive">{errors.brand.message}</p>
              )}
              {brands?.length === 0 && (
                <p className="text-sm text-amber-600">
                  No brands available. Please create a brand first.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Select from existing brands
              </p>
            </div>

            {/* Created By */}
            <div className="space-y-2">
              <Label htmlFor="created_by">
                Created By <span className="text-destructive">*</span>
              </Label>
              <Input
                id="created_by"
                placeholder="e.g., harsh, john-doe"
                {...register("created_by")}
                disabled={createLinkMutation.isPending}
              />
              {errors.created_by && (
                <p className="text-sm text-destructive">
                  {errors.created_by.message}
                </p>
              )}
            </div>

            {/* Campaign ID */}
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campaign ID (Optional)</Label>
              <Input
                id="campaign_id"
                placeholder="e.g., blog-klaviyo-integration"
                {...register("campaign_id")}
                disabled={createLinkMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Identifier for tracking this campaign
              </p>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Source (Optional)</Label>
              <Select
                value={selectedSource}
                onValueChange={(value) => setValue("source", value)}
                disabled={createLinkMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select traffic source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Where will this link be shared?
              </p>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (Optional JSON)</Label>
              <Textarea
                id="metadata"
                placeholder='{"post_title": "My Blog Post", "category": "Tutorial"}'
                {...register("metadata")}
                disabled={createLinkMutation.isPending}
                rows={4}
                className="font-mono text-sm"
              />
              {errors.metadata && (
                <p className="text-sm text-destructive">{errors.metadata.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Additional data in JSON format (optional)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createLinkMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLinkMutation.isPending}>
              {createLinkMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
