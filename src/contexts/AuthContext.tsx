import { createContext, useContext, useEffect, useState } from 'react';
import { 
  Auth,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  isOnline: boolean;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }

    return { isValid: true, message: '' };
  };

  const signup = async (email: string, password: string) => {
    if (!isOnline) {
      throw new Error('Cannot sign up while offline');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      toast.success('Verification email sent! Please check your inbox.');
      return result;
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use.');
      } else {
        toast.error('Failed to create account.');
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    if (!isOnline) {
      throw new Error('Cannot log in while offline');
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        await logout();
        throw new Error('Please verify your email before logging in');
      }
      return result;
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Invalid email or password.');
      } else if (error.message === 'Please verify your email before logging in') {
        toast.error(error.message);
      } else {
        toast.error('Failed to log in.');
      }
      throw error;
    }
  };

  const logout = async () => {
    if (!isOnline) {
      throw new Error('Cannot log out while offline');
    }
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      await sendEmailVerification(currentUser);
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to send verification email');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Failed to send password reset email');
      throw error;
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    isOnline,
    sendVerificationEmail,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}