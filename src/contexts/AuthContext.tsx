import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('Profile query result:', { data, error });

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    if (data) {
      console.log('Profile loaded successfully:', data);
      setProfile(data);
    } else {
      console.warn('No profile found for user:', userId);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Initializing...');

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Got session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          console.log('AuthContext: Initial load complete');
          setLoading(false);
        });
      } else {
        console.log('AuthContext: No session found');
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Error en signUp:', {
          message: error.message,
          status: (error as any).status,
          name: error.name,
        });
      } else {
        console.log('✅ SignUp exitoso:', {
          userId: data?.user?.id,
          email: data?.user?.email,
        });

        // Enviar email de bienvenida automáticamente
        if (data?.user) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              // Llamar a la Edge Function para enviar emails
              fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: data.user.email || email,
                  userId: data.user.id,
                  createdAt: data.user.created_at || new Date().toISOString(),
                }),
              }).catch((emailError) => {
                console.error('Error enviando email de bienvenida:', emailError);
                // No bloquear el registro si falla el email
              });
            }
          } catch (emailError) {
            console.error('Error al llamar Edge Function:', emailError);
            // No bloquear el registro si falla el email
          }
        }
      }
      
      return { error };
    } catch (error: any) {
      console.error('❌ Excepción en signUp:', error);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Error en signIn:', {
          message: error.message,
          status: (error as any).status,
          name: error.name,
        });
      } else {
        console.log('✅ SignIn exitoso:', {
          userId: data?.user?.id,
          email: data?.user?.email,
        });
      }
      
      return { error };
    } catch (error: any) {
      console.error('❌ Excepción en signIn:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      console.log('SignOut: Clearing session for user:', user?.email);

      setProfile(null);
      setUser(null);
      setSession(null);

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }

      console.log('SignOut: Complete');
    } catch (error) {
      console.error('Exception during sign out:', error);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
