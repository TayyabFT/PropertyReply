export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
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
      { href: "/app/profile", label: "Profile", icon: "👤" },
      { href: "/app/kyc", label: "KYC / Compliance", icon: "✅" },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/app/admin", label: "Admin Panel", icon: "🛡" }],
  },
];

const allItems: NavItem[] = navGroups.flatMap((group) => group.items);

export function titleFor(pathname: string): string {
  const match = allItems.find((item) => pathname.startsWith(item.href));
  return match?.label ?? "Overview";
}
