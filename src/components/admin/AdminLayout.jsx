"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Package,
  Tag,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";

// Navigation items
const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    name: "Produk",
    icon: Package,
    children: [
      { name: "Kelola Produk", href: "/admin/products" },
      { name: "Tambah Produk", href: "/admin/products/add" },
    ],
  },
  {
    name: "Kategori",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    name: "Pesanan",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Pelanggan",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Laporan",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const pathname = usePathname();
  const router = useRouter();

  // Toggle expanded state for menu items with children
  const toggleExpanded = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  // Check if current path matches navigation item
  const isCurrentPath = (href, children = null) => {
    if (href && pathname === href) return true;
    if (children) {
      return children.some((child) => pathname === child.href);
    }
    return false;
  };

  // Check if child path is current
  const isChildCurrent = (href) => pathname === href;

  // Handle logout
  const handleLogout = () => {
    console.log("Logout clicked");
    // router.push("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Mobile sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Mobile navigation content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Admin
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isCurrent = isCurrentPath(item.href, item.children);
                  const isExpanded = expandedItems[item.name];

                  return (
                    <div key={item.name}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={`w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                              isCurrent
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-5 w-5" />
                              {item.name}
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? "transform rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="mt-1 space-y-1">
                              {item.children.map((child) => (
                                <button
                                  key={child.name}
                                  onClick={() => {
                                    router.push(child.href);
                                    setSidebarOpen(false);
                                  }}
                                  className={`group w-full flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md ${
                                    isChildCurrent(child.href)
                                      ? "bg-green-100 text-green-700"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  {child.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            router.push(item.href);
                            setSidebarOpen(false);
                          }}
                          className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isCurrent
                              ? "bg-green-100 text-green-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile logout */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="group w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Admin
                </h1>
              </div>

              {/* Desktop navigation */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isCurrent = isCurrentPath(item.href, item.children);
                  const isExpanded = expandedItems[item.name];

                  return (
                    <div key={item.name}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={`w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                              isCurrent
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-3 h-5 w-5" />
                              {item.name}
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                isExpanded ? "transform rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="mt-1 space-y-1">
                              {item.children.map((child) => (
                                <button
                                  key={child.name}
                                  onClick={() => router.push(child.href)}
                                  className={`group w-full flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md ${
                                    isChildCurrent(child.href)
                                      ? "bg-green-100 text-green-700"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  }`}
                                >
                                  {child.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => router.push(item.href)}
                          className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isCurrent
                              ? "bg-green-100 text-green-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Desktop logout */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="group w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {/* Breadcrumb */}
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <span className="text-sm font-medium text-gray-500">
                      Admin
                    </span>
                  </li>
                  {pathname !== "/admin" && (
                    <li>
                      <div className="flex items-center">
                        <span className="text-gray-300 mx-2">/</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {pathname.split("/").filter(Boolean).pop()}
                        </span>
                      </div>
                    </li>
                  )}
                </ol>
              </nav>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <button className="p-1 text-gray-400 hover:text-gray-500 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">A</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
