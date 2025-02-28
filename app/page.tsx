"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { isLoggedIn, login, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push("/home");
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-[320px] space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-[#4169E1]">PrivyPay</h1>
          <p className="text-lg text-muted-foreground">Your Wallet&apos;s Best Friend</p>
        </div>

        <div className="space-y-4">
          <Button className="w-full bg-[#4169E1] hover:bg-[#3158D3]" size="lg" onClick={login}>
            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to access your PrivyPay account
          </p>
        </div>
      </div>
    </div>
  );
}
