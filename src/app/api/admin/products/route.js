// File: src/app/api/admin/products/route.js

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

    if (category && category !== "Semua Kategori") {
      where.categories = {
        some: {
          category: {
            name: category,
          },
        },
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // Get the products with their categories
    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transform the data to include category names
    const transformedProducts = products.map((product) => ({
      ...product,
      categoryNames: product.categories.map((pc) => pc.category.name),
      // Keep backward compatibility with single category field
      category:
        product.categories.length > 0
          ? product.categories[0].category.name
          : "",
    }));

    // Return the products with pagination metadata
    return NextResponse.json(
      {
        data: transformedProducts,
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
    if (
      !data.name ||
      !data.categories ||
      data.categories.length === 0 ||
      data.price === undefined
    ) {
      return NextResponse.json(
        { message: "Nama, kategori, dan harga produk wajib diisi" },
        { status: 400 }
      );
    }

    // Create the product with categories
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        price: parseInt(data.price),
        discountPrice: data.discountPrice ? parseInt(data.discountPrice) : null,
        stock: data.stock ? parseInt(data.stock) : 0,
        unit: data.unit || "porsi",
        description: data.description || "",
        isNewArrival: data.isNewArrival || false,
        mediaUrl: data.mediaUrl || null,
        rating: data.rating ? parseFloat(data.rating) : 0,
        reviewCount: data.reviewCount ? parseInt(data.reviewCount) : 0,
        categories: {
          create: data.categories.map((categoryName) => ({
            category: {
              connectOrCreate: {
                where: { name: categoryName },
                create: { name: categoryName },
              },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transform the response
    const transformedProduct = {
      ...newProduct,
      categoryNames: newProduct.categories.map((pc) => pc.category.name),
    };

    return NextResponse.json(
      { message: "Produk berhasil ditambahkan", data: transformedProduct },
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
