// This file would be saved as /src/app/api/foods/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all foods or filter by category
export async function GET(request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search");

    const pageSize = limit ? parseInt(limit) : 10;
    const skip = (parseInt(page) - 1) * pageSize;

    // Build the where clause for filtering
    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Get the foods with their media and variants
    const foods = await prisma.product.findMany({
      where,
      include: {
        media: true,
        variants: {
          include: {
            media: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    // Return the foods with pagination metadata
    return NextResponse.json(
      {
        data: foods,
        meta: {
          page: parseInt(page),
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching foods:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat mengambil data produk",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
