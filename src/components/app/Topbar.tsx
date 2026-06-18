"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { titleFor } from "./navItems";
import { IconBell, IconSearch } from "@/components/icons/NavIcons";
import UserMenu from "./UserMenu";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <header className="app-topbar">
      <button className="app-menu-btn" aria-label="Open menu" onClick={onMenu}>
        ☰
      </button>

      <div className="app-breadcrumb">
        <span>PropertyReply</span>
        <span>/</span>
        <span className="crumb-current">{title}</span>
      </div>

      <div className="app-topbar-search">
        <span className="s-icon">
          <IconSearch />
        </span>
        <input type="text" placeholder="Search deals, locations…" />
      </div>

      <Link
        href="/app/notifications"
        className="icon-btn"
        aria-label="Notifications"
      >
        <IconBell />
        <span className="dot-badge" />
      </Link>

      <UserMenu />
    </header>
  );
}
