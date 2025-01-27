import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import * as authService from "../services/auth";

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(
      (user: User | null) => {
        setUser(user);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAuth = async (
    authMethod: (email: string, password: string) => Promise<User>,
    email: string,
    password: string
  ) => {
    try {
      setError(null);
      setLoading(true);
      await authMethod(email, password);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    await handleAuth(authService.signIn, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await handleAuth(authService.signUp, email, password);
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await authService.resetPassword(email);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await authService.logout();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    resetPassword,
  };
}
