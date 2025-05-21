// src/lib/prisma.js
import { PrismaClient } from "@/generated/prisma";

// Pendekatan JavaScript murni
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Mencegah multiple instances selama hot reload
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
