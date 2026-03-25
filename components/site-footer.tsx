import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t py-4">
      <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Askwiseo. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="/terms-privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Terms
          </Link>
          <Link href="/terms-privacy#privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
