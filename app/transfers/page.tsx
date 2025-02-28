"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy, useWallets, useSendTransaction } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { toast, Toaster } from "sonner";
import { parseUnits, encodeFunctionData, formatUnits } from "viem";

const tokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    chainId: 1,
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    chainId: 1,
    decimals: 6,
    isNative: false,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    symbol: "SepoliaETH",
    name: "Sepolia Ethereum",
    chainId: 11155111,
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "SepoliaUSDC",
    name: "Sepolia USD Coin",
    chainId: 11155111,
    decimals: 6,
    isNative: false,
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
];

const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export default function TransfersPage() {
  const router = useRouter();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [recipient, setRecipient] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("recipient") || "";
    }
    return "";
  });
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(tokens[0]);

  const { sendTransaction, isSending } = useSendTransaction();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const recipientFromURL = params.get("recipient");
      if (recipientFromURL) {
        setRecipient(recipientFromURL);
      }
    }
  }, []);

  const handleTransfer = async () => {
    if (!user || !wallets.length) {
      toast.error("User not authenticated or no wallet available");
      return;
    }

    try {
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");

      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      const amountInSmallestUnit = parseUnits(amount, selectedToken.decimals);

      let txHash;
      if (selectedToken.isNative) {
        txHash = await sendTransaction({
          to: recipient,
          value: amountInSmallestUnit,
          chainId: selectedToken.chainId,
        });
      } else {
        const data = encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient, amountInSmallestUnit],
        });

        txHash = await sendTransaction({
          to: selectedToken.address,
          data,
          chainId: selectedToken.chainId,
        });
      }

      // Store transaction in the database
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: embeddedWallet.address,
          to: recipient,
          amount: formatUnits(amountInSmallestUnit, selectedToken.decimals),
          token: selectedToken.symbol,
          hash: txHash,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to store transaction");
      }

      toast.success("Transfer initiated", {
        description: `Transaction hash: ${txHash.hash}`,
      });

      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="h-8 bg-white"></div>
      <main className="flex-1 px-4 pt-4 pb-20">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/home")}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold ml-2">Transfer Tokens</h1>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Send Tokens</CardTitle>
            <CardDescription>Transfer tokens to another wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
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
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleTransfer}
              disabled={isSending || !recipient || !amount}
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Transferring...
                </div>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send {selectedToken.symbol}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <BottomNavigation />
      <Toaster />
    </div>
  );
}
