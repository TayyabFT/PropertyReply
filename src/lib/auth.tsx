"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, type ApiUser } from "@/lib/api";

export type User = ApiUser;

type AuthContextValue = {
  user: User | null;
  token: string | null;
  ready: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
};

const TOKEN_KEY = "pr_token";
const KYC_COOKIE = "pr_kyc";

function persistKycCookie(status: string | null) {
  if (typeof document === "undefined") return;
  if (status) {
    document.cookie = `${KYC_COOKIE}=${encodeURIComponent(status)}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = `${KYC_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistToken(token: string | null) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const savedToken = readToken();
      if (!savedToken) {
        setReady(true);
        return;
      }

      try {
        const response = await authApi.me(savedToken);
        setUser(response.data.user);
        setToken(savedToken);
        persistKycCookie(response.data.user.kycStatus || "pending");
      } catch {
        persistToken(null);
        setUser(null);
        setToken(null);
      } finally {
        setReady(true);
      }
    }

    restoreSession();
  }, []);

  const applyAuth = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    persistToken(nextToken);
    persistKycCookie(nextUser.kycStatus || "pending");
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      setLoading(true);
      try {
        const response = await authApi.login({ email, password });
        applyAuth(response.data.user, response.data.token);
        return response.data.user;
      } finally {
        setLoading(false);
      }
    },
    [applyAuth],
  );

  const register = useCallback(
    async (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      setLoading(true);
      try {
        const response = await authApi.register(input);
        applyAuth(response.data.user, response.data.token);
      } finally {
        setLoading(false);
      }
    },
    [applyAuth],
  );

  const signOut = useCallback(async () => {
    const currentToken = token || readToken();
    if (currentToken) {
      try {
        await authApi.logout(currentToken);
      } catch {
        // still clear local session if API fails
      }
    }
    setUser(null);
    setToken(null);
    persistToken(null);
    persistKycCookie(null);
  }, [token]);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    persistKycCookie(nextUser.kycStatus || "pending");
  }, []);

  const value = useMemo(
    () => ({ user, token, ready, loading, login, register, signOut, updateUser }),
    [user, token, ready, loading, login, register, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
