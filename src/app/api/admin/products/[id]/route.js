// File: src/app/api/admin/products/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch a single product by ID for admin
export async function GET(request, { params }) {
  try {
    const { id } = params;
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
        categories: {
          include: {
            category: true,
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

    // Transform the data to include category names
    const transformedProduct = {
      ...product,
      categoryNames: product.categories.map((pc) => pc.category.name),
      // Keep backward compatibility
      category:
        product.categories.length > 0
          ? product.categories[0].category.name
          : "",
    };

    return NextResponse.json(transformedProduct, { status: 200 });
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

// PUT - Update a product
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const productId = parseInt(id);
    const data = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: "ID produk tidak valid" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
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
          // Delete existing categories
          deleteMany: {},
          // Create new categories
          create: data.categories
            ? data.categories.map((categoryName) => ({
                category: {
                  connectOrCreate: {
                    where: { name: categoryName },
                    create: { name: categoryName },
                  },
                },
              }))
            : [],
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
      ...updatedProduct,
      categoryNames: updatedProduct.categories.map((pc) => pc.category.name),
    };

    return NextResponse.json(
      { message: "Produk berhasil diperbarui", data: transformedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating product:`, error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat memperbarui produk",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a product
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: "ID produk tidak valid" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete the product (categories will be deleted automatically due to cascade)
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Produk berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting product:`, error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menghapus produk",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
