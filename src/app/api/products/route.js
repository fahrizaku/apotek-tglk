import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all products or filter by category
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

    // Get the products (without media and variants as they no longer exist)
    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    // Return the products with pagination metadata
    return NextResponse.json(
      {
        data: products,
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
    console.error("Error fetching products:", error);
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
