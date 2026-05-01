"use client";

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
      if (user) {
        const token = await user.getIdToken();
        document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
        setUser(user);
      } else {
        document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear Firebase session
      await signOut(auth);
      // Clear localStorage/sessionStorage/cookies
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        // Remove all cookies
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
        });
      }
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      router.push("/login"); // Always redirect even if error
    }
  };

  return {
    user,
    loading,
    handleLogout
  };
} 