"use client";

import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import { useWallets, usePrivy, useFundWallet } from "@privy-io/react-auth";
import { BottomNavigation } from "@/components/BottomNavigation";

import { tokens } from "../constants/card";

export default function CardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { wallets } = useWallets();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fundWallet } = useFundWallet();
  const { ready } = usePrivy();

  const handleFundWallet = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsFunding(true);
    setError(null);

    try {
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      await fundWallet(embeddedWallet.address, {
        chain: selectedToken.chain,
        amount,
        asset: "USDC",
        card: {
          preferredProvider: "moonpay",
        },
        defaultFundingMethod: "card",
      });
    } catch (error) {
      console.error("Error funding wallet:", error);
      setError("Failed to initiate funding. Please try again.");
    } finally {
      setIsFunding(false);
    }
  }, [amount, wallets, fundWallet, selectedToken]);

  if (isAuthLoading) {
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Status Bar */}
      <div className="h-8 bg-white"></div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-8 pb-20">
        <h1 className="text-2xl font-semibold mb-6">Card & Wallet</h1>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Fund Your Wallet</CardTitle>
            <CardDescription>Add funds to your SwiftPay wallet using MoonPay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Select Token</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedToken(tokens.find((t) => t.symbol === value) || tokens[0])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Current Wallet Address:</p>
                <div className="bg-gray-100 p-2 rounded text-center font-mono text-sm break-all">
                  {user.wallet?.address || "No wallet connected"}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-[#4169E1] hover:bg-[#3158D3]"
              onClick={handleFundWallet}
              disabled={isFunding || !ready}
            >
              {isFunding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" /> Fund Wallet with {selectedToken.symbol}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <div
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
