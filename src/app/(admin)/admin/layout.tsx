import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "MentorMe Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Unauthenticated requests (only the login page reaches here, since middleware
  // redirects every other admin path to /admin/login). Render standalone.
  if (!session?.user?.id) {
    return (
      <div dir="ltr" className="min-h-screen bg-[var(--color-bg)]">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <div dir="ltr" className="flex min-h-screen bg-[var(--color-bg)]">
      <AdminSidebar role={session.user.role} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader
          name={session.user.name ?? null}
          email={session.user.email ?? null}
          role={session.user.role}
        />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-8">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
