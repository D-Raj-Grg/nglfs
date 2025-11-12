import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Content */}
      <main id="main-content" className="lg:ml-64 min-h-screen pb-24 lg:pb-0" role="main">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
