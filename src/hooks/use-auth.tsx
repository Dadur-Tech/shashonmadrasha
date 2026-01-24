import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "admin" | "accountant" | "teacher" | "staff";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  rolesLoaded: boolean;
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
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const fetchRoles = async (userId: string) => {
    try {
      setRolesLoaded(false);
      console.log("[Auth] Fetching roles for user:", userId);
      const { data: userRoles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        // Don't block auth flow on roles fetch issues
        console.error("[Auth] fetchRoles error:", error.message, error.code, error.details);
        setRoles([]);
        setRolesLoaded(true);
        return;
      }

      console.log("[Auth] Fetched roles:", userRoles);
      const mappedRoles = (userRoles || []).map((r) => r.role as AppRole);
      setRoles(mappedRoles);
      setRolesLoaded(true);
      console.log("[Auth] Set roles to:", mappedRoles);
    } catch (e) {
      console.error("[Auth] fetchRoles exception:", e);
      setRoles([]);
      setRolesLoaded(true);
    }
  };

  useEffect(() => {
    // Fail-safe: never let auth loading spin forever
    const failSafe = window.setTimeout(() => {
      console.log("[Auth] Fail-safe timeout triggered");
      setLoading(false);
    }, 5000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[Auth] onAuthStateChange event:", event, "user:", newSession?.user?.email);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setRolesLoaded(false);
          // IMPORTANT: Defer database calls to avoid race condition with session
          // See: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
          setTimeout(async () => {
            try {
              await fetchRoles(newSession.user.id);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setRoles([]);
          setRolesLoaded(true);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth
      .getSession()
      .then(({ data: { session: existingSession } }) => {
        console.log("[Auth] getSession result:", existingSession?.user?.email);
        
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          setRolesLoaded(false);
          // Defer to ensure Supabase client has token set
          setTimeout(async () => {
            try {
              await fetchRoles(existingSession.user.id);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setRolesLoaded(true);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("[Auth] getSession error:", e);
        setRolesLoaded(true);
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
    setRolesLoaded(true);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const refreshRoles = async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user;
    if (!currentUser) {
      setRoles([]);
      setRolesLoaded(true);
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
        rolesLoaded,
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
