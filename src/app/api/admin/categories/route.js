// File: src/app/api/admin/categories/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all categories
export async function GET(request) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
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

// POST - Create a new category
export async function POST(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "Kategori dengan nama tersebut sudah ada" },
        { status: 409 }
      );
    }

    // Create the category
    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || "",
      },
    });

    return NextResponse.json(
      { message: "Kategori berhasil ditambahkan", data: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menambahkan kategori",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
