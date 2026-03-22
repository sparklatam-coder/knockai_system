"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { AuthRole } from "@/lib/types";

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AuthRole;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveRole(user: User | null): AuthRole {
  const rawRole = user?.user_metadata?.role;

  if (rawRole === "admin") {
    return "admin";
  }

  if (user) {
    return "client";
  }

  return "guest";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!hasSupabaseEnv || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async ({ email, password }: SignInCredentials) => {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        return {
          error: "Supabase 환경변수가 설정되지 않았습니다.",
        };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        error: error?.message ?? null,
      };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: hasSupabaseEnv,
      loading,
      session,
      user,
      role: resolveRole(user),
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
    }),
    [loading, session, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
