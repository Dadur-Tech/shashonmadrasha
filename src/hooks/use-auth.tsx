import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "admin" | "accountant" | "teacher" | "staff";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isAccountant: boolean;
  isTeacher: boolean;
  refreshRoles: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchRoles = async (userId: string) => {
    try {
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        // Don't block auth flow on roles fetch issues
        console.warn("fetchRoles error", error);
        setRoles([]);
        return;
      }

      setRoles((userRoles || []).map((r) => r.role as AppRole));
    } catch (e) {
      console.warn("fetchRoles exception", e);
      setRoles([]);
    }
  };

  useEffect(() => {
    // Fail-safe: never let auth loading spin forever
    const failSafe = window.setTimeout(() => {
      setLoading(false);
    }, 4000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchRoles(session.user.id);
          } else {
            setRoles([]);
          }
        } finally {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchRoles(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch((e) => {
        console.warn("getSession error", e);
        setLoading(false);
      });

    return () => {
      window.clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const refreshRoles = async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user;
    if (!currentUser) {
      setRoles([]);
      return;
    }
    await fetchRoles(currentUser.id);
  };

  const isAdmin = roles.includes("super_admin") || roles.includes("admin");
  const isAccountant = roles.includes("accountant") || isAdmin;
  const isTeacher = roles.includes("teacher") || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        isAdmin,
        isAccountant,
        isTeacher,
        refreshRoles,
        signUp,
        signIn,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
