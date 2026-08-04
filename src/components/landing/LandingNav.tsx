"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";

const sections: { id: string; label: string }[] = [
  { id: "hero", label: "Home" },
  { id: "listings", label: "Live Deals" },
  { id: "membership", label: "Membership" },
  { id: "trust", label: "Trust & Legal" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="page-nav">
      <div className="container">
        <BrandLogo href="#hero" height={44} onClick={() => setOpen(false)} />

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>

        <div className={open ? "nav-links open" : "nav-links"}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={
                active === section.id ? "nav-link-a active" : "nav-link-a"
              }
              onClick={() => setOpen(false)}
            >
              {section.label}
            </a>
          ))}
          <Link
            href="/login"
            className="btn btn-outline btn-sm"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn btn-gold btn-sm"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
