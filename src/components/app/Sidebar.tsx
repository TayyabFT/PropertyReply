"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { navGroups } from "./navItems";
import { NavIcon } from "@/components/icons/NavIcons";
import { useAuth } from "@/lib/auth";

function iconKey(href: string) {
  return href.replace("/app/", "");
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const visibleGroups = navGroups.filter(
    (group) => group.label !== "Administration" || isAdmin,
  );

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-head">
        <BrandLogo
          href="/app/dashboard"
          height={40}
          onClick={onNavigate}
        />
        <button
          className="sidebar-close"
          aria-label="Close menu"
          onClick={onNavigate}
        >
          ✕
        </button>
      </div>

      <nav className="app-nav">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <div className="app-nav-label">{group.label}</div>
            {group.items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "app-nav-link active" : "app-nav-link"}
                  onClick={onNavigate}
                >
                  <NavIcon name={iconKey(item.href)} />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="app-sidebar-foot">
        <Link
          href="/app/profile"
          className="app-user-card"
          onClick={onNavigate}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="avatar">{user?.initials ?? "PR"}</div>
          <div>
            <div className="u-name">{user?.name ?? "Member"}</div>
            <div className="u-plan">{user?.plan ? `${user.plan} Member` : "No Plan"}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
