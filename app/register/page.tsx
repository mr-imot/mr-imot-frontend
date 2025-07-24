"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function RegisterFormContent() {
  const searchParams = useSearchParams()
  const userType = searchParams.get("type")

  const title = userType === "developer" ? "Register as Developer" : "Register as Buyer"
  const description =
    userType === "developer"
      ? "Create your developer account to list projects."
      : "Create your buyer account to find projects."

  return (
    <Card className="w-full max-w-md mx-auto bg-nova-surface shadow-card rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-[2.5rem] font-bold leading-[1.2] text-3xl font-bold text-nova-text-primary">
          {title}
        </CardTitle>
        <CardDescription className="text-base font-normal leading-[1.6] text-nova-text-secondary">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-lg">
        <form className="space-y-lg">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-nova-text-primary mb-sm">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              className="w-full border-nova-border rounded-sm focus:border-nova-primary"
            />
          </div>
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
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-nova-text-primary mb-sm">
              Confirm Password
            </label>
            <Input
              id="confirm-password"
              type="password"
              required
              className="w-full border-nova-border rounded-sm focus:border-nova-primary"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-nova-primary text-nova-primary-foreground hover:bg-nova-primary-dark"
          >
            Register
          </Button>
        </form>
        <div className="mt-lg text-center text-sm text-nova-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-nova-secondary hover:underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-72px)] py-xl bg-nova-background">
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterFormContent />
      </Suspense>
    </div>
  )
}
