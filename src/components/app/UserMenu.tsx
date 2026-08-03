"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="avatar">{user?.initials ?? "PR"}</div>
        <span className="um-name">{user?.name ?? "Member"}</span>
        <span style={{ fontSize: ".7rem", color: "var(--slate)" }}>▾</span>
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="um-head">
            <p>{user?.name ?? "Member"}</p>
            <span>{user?.email ?? ""}</span>
          </div>
          <Link
            href="/app/profile"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            <span>👤</span> Profile Settings
          </Link>
          <Link
            href="/app/membership"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            <span>💳</span> Membership
          </Link>
          <Link
            href="/app/kyc"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            <span>✅</span> KYC Status
          </Link>
          <button className="user-menu-item danger" onClick={handleSignOut}>
            <span>↩</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
