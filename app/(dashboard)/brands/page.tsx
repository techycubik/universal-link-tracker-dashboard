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
import { Plus, Building2, Link as LinkIcon } from "lucide-react";
import { CreateLinkDialog } from "@/components/links/create-link-dialog";
import { AddBrandDialog } from "@/components/brands/add-brand-dialog";

export default function BrandsPage() {
  const [showCreateLinkDialog, setShowCreateLinkDialog] = useState(false);
  const [showAddBrandDialog, setShowAddBrandDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      if (!res.ok) throw new Error("Failed to fetch brands");
      return res.json();
    },
  });

  const handleCreateLink = (brand?: string) => {
    setSelectedBrand(brand);
    setShowCreateLinkDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateLinkDialog(false);
    setSelectedBrand(undefined);
  };

  const handleCloseBrandDialog = () => {
    setShowAddBrandDialog(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
            <p className="text-muted-foreground">
              Manage your brands and view analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddBrandDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
            <Button onClick={() => handleCreateLink()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          </div>
        </div>
        <div>Loading brands...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
            <p className="text-muted-foreground">
              Manage your brands and view analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddBrandDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
            <Button onClick={() => handleCreateLink()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {brands?.map((brand: any) => (
          <Card key={brand.name}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Building2 className="h-6 w-6 text-muted-foreground mr-2" />
              <div className="flex-1">
                <CardTitle className="text-lg">{brand.name}</CardTitle>
                <CardDescription>
                  Brand analytics and link management
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Links</p>
                  <p className="text-2xl font-bold">{brand.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Links</p>
                  <p className="text-2xl font-bold text-green-600">
                    {brand.active}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Badge variant={brand.active > 0 ? "default" : "secondary"}>
                  {brand.active} Active
                </Badge>
                <Badge variant="outline">{brand.inactive} Inactive</Badge>
                <Badge variant="outline">{brand.expired} Expired</Badge>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCreateLink(brand.name)}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Create Link
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {brands?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No brands found</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create your first brand to get started. Once you have a brand, you can create tracked links for it.
            </p>
            <Button onClick={() => setShowAddBrandDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Brand
            </Button>
          </CardContent>
        </Card>
      )}
      </div>

      <CreateLinkDialog
        open={showCreateLinkDialog}
        onOpenChange={handleCloseDialog}
        defaultBrand={selectedBrand}
      />

      <AddBrandDialog
        open={showAddBrandDialog}
        onOpenChange={handleCloseBrandDialog}
      />
    </>
  );
}
