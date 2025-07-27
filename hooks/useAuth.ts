"use client";

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
      setUser(user);
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
      router.push("/auth");
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      router.push("/auth"); // Always redirect even if error
    }
  };

  return {
    user,
    loading,
    handleLogout
  };
} 