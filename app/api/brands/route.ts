import { NextRequest, NextResponse } from "next/server";
import { getAllBrands, getBrandStats, createBrand } from "@/lib/dynamodb/brands";

export async function GET(request: NextRequest) {
  try {
    const brands = await getAllBrands();

    // Get stats for each brand
    const brandsWithStats = await Promise.all(
      brands.map(async (brand) => {
        const stats = await getBrandStats(brand);
        return {
          name: brand,
          ...stats,
        };
      })
    );

    return NextResponse.json(brandsWithStats);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Validate brand name format
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return NextResponse.json(
        { error: "Brand name can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    // Check if brand already exists
    const existingBrands = await getAllBrands();
    if (existingBrands.includes(name)) {
      return NextResponse.json(
        { error: "Brand already exists" },
        { status: 409 }
      );
    }

    // Create the brand
    await createBrand(name);

    return NextResponse.json(
      {
        success: true,
        brand: {
          name,
          total: 0,
          active: 0,
          inactive: 0,
          expired: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
