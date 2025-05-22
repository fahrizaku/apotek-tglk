// File: src/app/admin/layout.js
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
  title: "Admin Panel",
  description: "Panel administrasi untuk mengelola aplikasi",
};

export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
