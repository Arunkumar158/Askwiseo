export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#0f172a] px-4 py-8 text-slate-50 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-md flex-col items-center">
        {children}
      </div>
    </div>
  )
}
