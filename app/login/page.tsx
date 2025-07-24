import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Suspense } from "react"

function LoginFormContent() {
  return (
    <Card className="w-full max-w-md mx-auto bg-nova-surface shadow-card rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-[2.5rem] font-bold leading-[1.2] text-3xl font-bold text-nova-text-primary">
          Login to MrImot
        </CardTitle>
        <CardDescription className="text-base font-normal leading-[1.6] text-nova-text-secondary">
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-lg">
        <form className="space-y-lg">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-nova-text-primary mb-sm">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@example.com"
              required
              className="w-full border-nova-border rounded-sm focus:border-nova-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-nova-text-primary mb-sm">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              className="w-full border-nova-border rounded-sm focus:border-nova-primary"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-nova-primary text-nova-primary-foreground hover:bg-nova-primary-dark"
          >
            Login
          </Button>
        </form>
        <div className="mt-lg text-center text-sm text-nova-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-nova-secondary hover:underline">
            Register
          </Link>
        </div>
        <div className="mt-md text-center text-sm text-nova-text-secondary">
          <Link href="/forgot-password" className="text-nova-secondary hover:underline">
            Forgot Password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] py-xl bg-nova-background">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  )
}
