"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "@/lib/auth";
import { userHasPlanAccess } from "@/lib/planAccess";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  // Users without trial or paid subscription are locked to membership,
  // except submit/KYC so they can finish a draft and see the publish prompt.
  useEffect(() => {
    if (!ready || !user || user.role === "admin") return;
    if (userHasPlanAccess(user)) return;

    const allowedWithoutPlan =
      pathname.startsWith("/app/membership") ||
      pathname.startsWith("/app/submit") ||
      pathname.startsWith("/app/kyc") ||
      pathname.startsWith("/app/profile");

    if (!allowedWithoutPlan) {
      router.replace("/app/membership");
    }
  }, [ready, user, pathname, router]);

  // Restrict the admin area to admin accounts only.
  useEffect(() => {
    if (ready && user && user.role !== "admin" && pathname.startsWith("/app/admin")) {
      router.replace("/app/dashboard");
    }
  }, [ready, user, pathname, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("app-nav-open", navOpen);
    return () => document.body.classList.remove("app-nav-open");
  }, [navOpen]);

  if (!ready || !user) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <span>Loading your workspace…</span>
      </div>
    );
  }

  return (
    <div className={navOpen ? "app-shell nav-open" : "app-shell"}>
      <Sidebar onNavigate={() => setNavOpen(false)} />
      <div
        className="app-backdrop"
        onClick={() => setNavOpen(false)}
        aria-hidden
      />
      <div className="app-main">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="app-content">
          <div className="app-page" key={pathname}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
