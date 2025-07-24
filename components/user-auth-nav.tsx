import Link from "next/link"
import { Button } from "@/components/ui/button"

export function UserAuthNav() {
  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/login"
        className="text-base font-medium text-ds-neutral-700 hover:text-ds-primary-600 transition-colors duration-200"
      >
        Sign In
      </Link>
      <Button
        asChild
        className="bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold px-6 py-2 h-10 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Link href="/register?type=developer">List Your Project</Link>
      </Button>
    </div>
  )
}
