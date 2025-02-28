"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      console.error("Login failed", error);
      // Handle login error (e.g., show error message)
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white p-4">
      <Link href="/" className="mb-8">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>

      <div className="mx-auto w-full max-w-[320px] space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            className="w-full bg-[#4169E1] hover:bg-[#3158D3]"
            size="lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link href="/forgot-password" className="text-[#4169E1] hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
