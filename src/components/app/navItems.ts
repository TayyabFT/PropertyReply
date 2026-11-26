export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  /** Only shown to accounts an admin has made affiliates */
  affiliateOnly?: boolean;
  /** Active only on this exact path (not its sub-pages) */
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Marketplace",
    items: [
      { href: "/app/dashboard", label: "Overview", icon: "📊" },
      { href: "/app/listings", label: "Browse Deals", icon: "🏠" },
      { href: "/app/deal-analysis", label: "Deal Analysis", icon: "📈" },
      { href: "/app/submit", label: "Submit Deal", icon: "📝" },
      { href: "/app/enquiries", label: "Enquiries", icon: "💬" },
      { href: "/app/notifications", label: "Notifications", icon: "🔔" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/app/membership", label: "Membership", icon: "💳" },
      { href: "/app/affiliate", label: "Affiliate", icon: "🤝", affiliateOnly: true },
      { href: "/app/profile", label: "Profile", icon: "👤" },
      { href: "/app/kyc", label: "KYC / Compliance", icon: "✅" },
    ],
  },
];

/** Admins see admin tools instead of the member marketplace pages. */
export const adminNavGroups: NavGroup[] = [
  {
    label: "Admin",
    items: [
      { href: "/app/admin", label: "Overview", icon: "📊", exact: true },
      { href: "/app/admin/queue", label: "Listing Queue", icon: "🏠" },
      { href: "/app/admin/listings", label: "Live Listings", icon: "🏷" },
      { href: "/app/admin/reports", label: "Reports", icon: "⚑" },
      { href: "/app/admin/users", label: "Users", icon: "👥" },
    ],
  },
  {
    label: "Partners",
    items: [
      { href: "/app/admin/affiliates", label: "Affiliates", icon: "🤝" },
      { href: "/app/admin/founders", label: "Founders Club", icon: "🏛" },
      { href: "/app/admin/partner-invites", label: "Invited Partners", icon: "✉" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/app/admin/admins", label: "Admin Accounts", icon: "🛡" },
      { href: "/app/notifications", label: "Notifications", icon: "🔔" },
      { href: "/app/profile", label: "Profile", icon: "👤" },
    ],
  },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const allItems: NavItem[] = [...navGroups, ...adminNavGroups].flatMap((group) => group.items);

export function titleFor(pathname: string): string {
  // Longest match wins so "/app/admin/users" isn't titled "Overview"
  const match = allItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Overview";
}
