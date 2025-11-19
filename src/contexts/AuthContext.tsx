// contexts/AuthContext.tsx
import { createContext, useContext, useState } from 'react';
import { Loader2 as LoaderIcon, LogIn as LoginIcon, LogOut as LogoutIcon } from 'lucide-react';
import Button from '../components/Button'; // Update the path to the correct location of the Button component

type AuthContextType = {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const login = async () => {
    setAuthLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAuthenticated(true);
    setAuthLoading(false);
  };

  const logout = async () => {
    setAuthLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAuthenticated(false);
    setAuthLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth UI Components
export function AuthButton() {
  const { isAuthenticated, login, logout, authLoading } = useAuth();
  
  return (
    <Button
      variant={isAuthenticated ? 'secondary' : 'primary'}
      size="md"
      icon={authLoading ? LoaderIcon : isAuthenticated ? LogoutIcon : LoginIcon}
      loading={authLoading}
      onClick={isAuthenticated ? logout : login}
      className="min-w-[120px]"
    >
      {isAuthenticated ? 'Sign Out' : 'Sign In'}
    </Button>
  );
}

export function AuthStatus() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-gray-500'}`} />
      <span>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
    </div>
  );
}