"use client";

import { useEffect } from "react";
import { affiliatesApi } from "@/lib/api";
import { readReferralCode, saveReferralCode } from "@/lib/referral";

/**
 * Remembers an affiliate's ?ref=CODE for 30 days so they get credit if the
 * visitor signs up later. The first valid referral link a visitor uses wins.
 */
export default function ReferralCapture() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ref")?.trim().toUpperCase();
    if (!code || !/^[A-Z0-9]{3,20}$/.test(code) || readReferralCode()) return;
    affiliatesApi
      .click(code)
      .then((res) => {
        if (res.data.valid) saveReferralCode(code);
      })
      .catch(() => {
        // Referral tracking must never disrupt browsing
      });
  }, []);

  return null;
}
