"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BookOpen, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await resetPassword(email)
      setIsSuccess(true)
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-8 w-8 text-[#1A56DB]" />
        <span className="text-2xl font-bold tracking-tight">Askwiseo</span>
      </div>
      
      <Card className="w-full border-slate-800 bg-slate-900/50 shadow-[0_0_15px_rgba(26,86,219,0.1)] backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset password</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="space-y-1">
                <p className="font-medium text-slate-200">Check your email</p>
                <p className="text-sm text-slate-400">
                  We sent a reset link to <span className="text-slate-200">{email}</span>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-[#1A56DB]"
                />
              </div>
              <Button type="submit" className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4 pb-6">
          <Link href="/login" className="text-sm text-[#1A56DB] hover:underline font-medium">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
