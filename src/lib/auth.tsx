"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type User = {
  name: string;
  email: string;
  initials: string;
  plan: string;
};

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  signIn: (details?: { email?: string; name?: string }) => User;
  signOut: () => void;
};

const STORAGE_KEY = "pr_user";

const AuthContext = createContext<AuthContextValue | null>(null);

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>((details) => {
    const name = details?.name?.trim() || "James Smith";
    const email = details?.email?.trim() || "james@smith.co.uk";
    const nextUser: User = {
      name,
      email,
      initials: initialsFor(name),
      plan: "Premium",
    };
    setUser(nextUser);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore storage failures
    }
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
