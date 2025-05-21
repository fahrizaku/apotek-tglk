// This file would be saved as /src/app/api/admin/products/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all products
export async function GET(request) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build where clause
    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive", // Case insensitive search
      };
    }

    // Get all products with media and variants
    const products = await prisma.product.findMany({
      where,
      include: {
        media: true,
        variants: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Process products to ensure consistent data structure
    const processedproducts = products.map((product) => ({
      ...product,
      unit: product.unit || "porsi",
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      description: product.description || "-",
      variants: product.variants.map((variant) => ({
        ...variant,
        description: variant.description || "-",
        stock: variant.stock ?? 0,
      })),
    }));

    return NextResponse.json(processedproducts, { status: 200 });
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

// POST - Create a new product product
export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();

    const {
      name,
      category,
      price,
      discountPrice,
      rating,
      reviewCount,
      isNewArrival,
      stock,
      unit,
      description,
      media,
      variants,
    } = body;

    // Basic validation
    if (!name || !category || !price) {
      return NextResponse.json(
        {
          message: "Nama produk, kategori, dan harga harus diisi",
        },
        { status: 400 }
      );
    }

    // Create the product item along with its related media and variants
    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        rating: rating ? Number(rating) : null,
        reviewCount: reviewCount ? Number(reviewCount) : 0,
        isNewArrival: Boolean(isNewArrival),
        stock: Number(stock || 0),
        unit: unit || "porsi",
        description: description || null,

        // Create related media records
        media: {
          create: media
            .filter((item) => item.url && item.url.trim() !== "") // Only create media with non-empty URLs
            .map((item) => ({
              type: item.type,
              url: item.url,
              caption: item.caption || null,
              thumbnail: item.thumbnail || null,
            })),
        },

        // Create related variant records
        variants: {
          create: variants
            .filter((variant) => variant.name && variant.name.trim() !== "") // Only create variants with non-empty names
            .map((variant) => ({
              name: variant.name,
              price: Number(variant.price),
              discountPrice: variant.discountPrice
                ? Number(variant.discountPrice)
                : null,
              stock: Number(variant.stock || 0),
              description: variant.description || null,
              thumbnail: variant.thumbnail || null,

              // Create related media records for this variant
              media:
                variant.media && variant.media.length > 0
                  ? {
                      create: variant.media
                        .filter((item) => item.url && item.url.trim() !== "")
                        .map((item) => ({
                          type: item.type,
                          url: item.url,
                          caption: item.caption || null,
                          thumbnail: item.thumbnail || null,
                        })),
                    }
                  : undefined,
            })),
        },
      },
      // Include the created relations in the response
      include: {
        media: true,
        variants: {
          include: {
            media: true,
          },
        },
      },
    });

    // Return the created product with status 201 (Created)
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          message: "Produk dengan nama yang sama sudah ada",
        },
        { status: 400 }
      );
    }

    // Return a generic error message
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menyimpan produk",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    // Disconnect from the Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}
