"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  handleLogout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Signed in successfully")
    } catch (error) {
      toast.error("Failed to sign in")
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast.success("Account created successfully")
    } catch (error) {
      toast.error("Failed to create account")
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth)
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Failed to sign out")
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 