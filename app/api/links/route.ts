import { NextRequest, NextResponse } from "next/server";
import { createBrandLink, getAllBrands, getBrandLinks } from "@/lib/dynamodb/brands";
import { z } from "zod";

const createLinkSchema = z.object({
  real_url: z.string().url(),
  brand: z.string().min(1),
  created_by: z.string().min(1),
  campaign_id: z.string().optional(),
  source: z.string().optional(),
  metadata: z.any().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Get all brands
    const brands = await getAllBrands();

    // Fetch links for each brand
    const allLinksPromises = brands.map(async (brand) => {
      const links = await getBrandLinks(brand);
      // Filter out placeholder entries
      return links.filter((link) => link.UUID !== "_placeholder");
    });

    const allLinksArrays = await Promise.all(allLinksPromises);
    const allLinks = allLinksArrays.flat();

    // Sort by created_at descending (newest first)
    allLinks.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(allLinks);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createLinkSchema.parse(body);

    const link = await createBrandLink(validated);

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
