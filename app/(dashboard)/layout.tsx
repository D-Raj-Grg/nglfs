import { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { RealtimeNotificationProvider } from "@/components/notifications/realtime-notification-provider";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RealtimeNotificationProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <main id="main-content" className="min-h-screen pb-24 lg:pb-0" role="main">
            <div className="container mx-auto px-4 py-8 lg:px-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RealtimeNotificationProvider>
  );
}
