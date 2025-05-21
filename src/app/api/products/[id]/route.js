// This file would be saved as /src/app/api/products/[id]/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch a single product by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: "ID produk tidak valid" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        media: true,
        variants: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ensure minimum default values for UI consistency
    const processedProduct = {
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
    };

    return NextResponse.json(processedProduct, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product:`, error);
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
