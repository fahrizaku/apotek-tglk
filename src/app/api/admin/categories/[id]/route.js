// File: src/app/api/admin/categories/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch a single category by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat mengambil data kategori",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a category
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const categoryId = parseInt(id);
    const data = await request.json();

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists (excluding current category)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: data.name,
        id: { not: categoryId },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { message: "Kategori dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description || "",
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Kategori berhasil diperbarui", data: updatedCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat memperbarui kategori",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a category
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { message: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        {
          message: `Tidak dapat menghapus kategori yang memiliki ${existingCategory._count.products} produk. Hapus atau pindahkan produk terlebih dahulu.`,
        },
        { status: 409 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json(
      { message: "Kategori berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menghapus kategori",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
