import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserData {
  id?: number;
  role: 'admin' | 'editor' | 'author';
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: UserData | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  logOut: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signIn = async (email?: string, password?: string) => {
    if (!email || !password) return;
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error("Error signing in", error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = isAdmin || user?.role === 'editor';
  const isAuthor = isEditor || user?.role === 'author';

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData: user, 
      loading, 
      signIn, 
      logOut, 
      isAdmin: !!isAdmin,
      isEditor: !!isEditor,
      isAuthor: !!isAuthor
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
