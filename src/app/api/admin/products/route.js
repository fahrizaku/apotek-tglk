// This file would be saved as /src/app/api/admin/products/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all products for admin (with potential filtering)
export async function GET(request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page") || "1";

    const pageSize = limit ? parseInt(limit) : 10;
    const skip = (parseInt(page) - 1) * pageSize;

    // Build the where clause for filtering
    const where = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    if (category) {
      where.category = category;
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Get the products
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

// POST - Create a new product
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.category || data.price === undefined) {
      return NextResponse.json(
        { message: "Nama, kategori, dan harga produk wajib diisi" },
        { status: 400 }
      );
    }

    // Create the product
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        price: parseInt(data.price),
        discountPrice: data.discountPrice ? parseInt(data.discountPrice) : null,
        stock: data.stock ? parseInt(data.stock) : 0,
        unit: data.unit || "porsi",
        description: data.description || "",
        isNewArrival: data.isNewArrival || false,
        mediaUrl: data.mediaUrl || null,
        rating: data.rating ? parseFloat(data.rating) : 0,
        reviewCount: data.reviewCount ? parseInt(data.reviewCount) : 0,
      },
    });

    return NextResponse.json(
      { message: "Produk berhasil ditambahkan", data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menambahkan produk",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
