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
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retries = 3, delay = 1000) => {
    console.log('Fetching profile for user:', userId);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error(`Error loading profile (attempt ${attempt}/${retries}):`, error);
          if (attempt < retries) {
            // Esperar antes de reintentar, con backoff exponencial
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
            continue;
          }
          return;
        }

        if (data) {
          console.log('Profile loaded successfully:', data);
          setProfile(data);
          return;
        } else {
          console.warn(`No profile found for user (attempt ${attempt}/${retries}):`, userId);
          if (attempt < retries) {
            // Esperar antes de reintentar, el trigger puede estar procesando
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
            continue;
          }
        }
      } catch (err) {
        console.error(`Exception loading profile (attempt ${attempt}/${retries}):`, err);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
      }
    }
    
    console.warn('Profile not found after all retries for user:', userId);
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
        options: {
          emailRedirectTo: undefined, // Deshabilitar confirmación de email
        }
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

        // Enviar email de bienvenida automáticamente (completamente asíncrono, no bloquea)
        if (data?.user) {
          // Usar setTimeout para hacer esto completamente asíncrono y no bloquear
          setTimeout(async () => {
            try {
              // Esperar un poco para asegurar que la sesión esté lista
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                // Llamar a la Edge Function para enviar emails (sin await para no bloquear)
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
          }, 0);
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
      
      if (!error && user?.email) {
        // Enviar email de confirmación de cambio de contraseña
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const now = new Date();
            const changeDate = now.toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const changeTime = now.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            });
            
            // Llamar a la Edge Function para enviar email
            fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-change-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                changeDate,
                changeTime,
              }),
            }).catch((emailError) => {
              console.error('Error enviando email de cambio de contraseña:', emailError);
              // No bloquear el cambio de contraseña si falla el email
            });
          }
        } catch (emailError) {
          console.error('Error al llamar Edge Function de cambio de contraseña:', emailError);
          // No bloquear el cambio de contraseña si falla el email
        }
      }
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Usar la URL del sitio configurada o la URL actual
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectUrl = `${siteUrl}/reset-password`;
      
      console.log('📧 Enviando email de recuperación:', {
        email: email.trim(),
        redirectUrl,
      });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('❌ Error en resetPassword:', {
          message: error.message,
          status: (error as any).status,
          name: error.name,
        });
      } else {
        console.log('✅ Email de recuperación enviado a:', email);
      }
      
      return { error };
    } catch (error: any) {
      console.error('❌ Excepción en resetPassword:', error);
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
        resetPassword,
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
