import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function Register() {
  return (
    <div className="flex min-h-screen flex-col bg-white p-4">
      <Link href="/" className="mb-8">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>

      <div className="mx-auto w-full max-w-[320px] space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full bg-[#4169E1] hover:bg-[#3158D3]" size="lg">
            Create account
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-[#4169E1] hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

