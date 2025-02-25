"use client";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFundWallet } from "@privy-io/react-auth";
import { mainnet } from "viem/chains";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [copySuccess, setCopySuccess] = useState("");
  const { fundWallet } = useFundWallet();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
      </div>
    );
  }

  const OnClickFundWallet = async () => {
    // Error if user does not have a wallet
    if (!user?.wallet?.address) {
      console.error("Wallet does not exist.");
      return;
    }

    // Get details about the current user's on-ramp flow

    try {
      const walletAddress = user?.wallet?.address;
      await fundWallet(walletAddress, {
        chain: mainnet,
        card: {
          preferredProvider: "moonpay",
        },
      });
      console.log("Funding process started!");
    } catch (error) {
      console.error("Error funding wallet:", error);
    }
  };

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
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Details</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Wallet Address</p>
                <div className="flex flex-col items-start gap-2 py-2">
                  <a
                    onClick={OnClickFundWallet}
                    className="rounded-md border-none text-sm text-black transition-all cursor-pointer hover:underline"
                  >
                    Fund my wallet
                  </a>
                </div>
              </div>
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
              {copySuccess && <p className="text-green-500 text-xs mt-1">{copySuccess}</p>}
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
      <BottomNavigation />
    </div>
  );
}
