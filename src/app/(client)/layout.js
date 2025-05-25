//file: src/app/(client)/layout.js
import Navigation from "@/components/Navigation";
import { CartProvider } from "@/contexts/CartContext";

export const metadata = {
  title: "Apotek Delivery",
  description: "Apotek Delivery",
};

export default function RootLayout({ children }) {
  return (
    <CartProvider>
      <Navigation />

      {/* Main Content Wrapper with padding for navigation */}
      <main className="pt-16 md:pl-64 min-h-screen">
        {/* Mobile padding bottom to prevent content from being hidden under bottom nav */}
        <div className="pb-16 md:pb-0">{children}</div>
      </main>
    </CartProvider>
  );
}
