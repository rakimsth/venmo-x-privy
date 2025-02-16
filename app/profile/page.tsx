"use client";
import { Home, CreditCard, DollarSign, Bitcoin, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { UserPill } from "@privy-io/react-auth/ui";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { wallets } = useWallets();
  const [copySuccess, setCopySuccess] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const handleDisconnect = async () => {
    await logout();
    router.push("/");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Status Bar */}
      <div className="h-8 bg-white"></div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-8 pb-20">
        <h1 className="text-2xl font-semibold mb-6 text-center">Profile</h1>
        <UserPill />
        {wallets.toString()}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <p className="text-sm font-mono">
                  {user.wallet?.address.slice(0, 6)}...
                  {user.wallet?.address.slice(-4)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(user.wallet?.address || "")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copySuccess && (
                <p className="text-green-500 text-xs mt-1">{copySuccess}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Connected With</p>
              <p className="font-semibold">{user?.id || "Unknown"}</p>
            </div>
          </div>
        </Card>

        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          onClick={handleDisconnect}
        >
          <LogOut className="mr-2 h-4 w-4" /> Disconnect Wallet
        </Button>
      </main>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-2">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1"
            onClick={() => router.push("/")}
          >
            <Home className="h-5 w-5 text-gray-400" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Card</span>
          </Button>
          <div className="relative -top-5">
            <Button className="h-14 w-14 rounded-full bg-[#4169E1] hover:bg-[#3158D3] flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </Button>
          </div>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Bitcoin className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">Crypto</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1"
            onClick={() => router.push("/profile")}
          >
            <User className="h-5 w-5 text-[#4169E1]" />
            <span className="text-xs text-[#4169E1]">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
