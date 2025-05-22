import Navigation from "@/components/Navigation";

export const metadata = {
  title: "admin",
  description: "admin panel",
};

export default function RootLayout({ children }) {
  return (
    <>
      <Navigation />

      {/* Main Content Wrapper with padding for navigation */}
      <main className="pt-16 md:pl-64 min-h-screen">
        {/* Mobile padding bottom to prevent content from being hidden under bottom nav */}
        <div className="pb-16 md:pb-0">{children}</div>
      </main>
    </>
  );
}
