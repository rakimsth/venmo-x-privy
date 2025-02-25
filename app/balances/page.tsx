"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Bitcoin, ExternalLink, RefreshCcw } from "lucide-react";
import { useWallets } from "@privy-io/react-auth";
import { formatEther, formatUnits, parseAbi, createPublicClient, http, type Address } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { BottomNavigation } from "@/components/BottomNavigation";

type TokenBalance = {
  symbol: string;
  balance: string;
  value: string;
  network: string;
};

const NETWORKS = [
  {
    name: "Ethereum Mainnet",
    chain: mainnet,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    blockExplorer: "https://etherscan.io",
  },
  {
    name: "Sepolia Testnet",
    chain: sepolia,
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SepoliaETH",
      decimals: 18,
    },
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
    blockExplorer: "https://sepolia.etherscan.io",
  },
];

const ERC20_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);

export default function CryptoPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { wallets } = useWallets();
  const router = useRouter();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setError(null);

    try {
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");
      if (!embeddedWallet) throw new Error("No embedded wallet found");

      const [mainnetClient, sepoliaClient] = NETWORKS.map((network) =>
        createPublicClient({
          chain: network.chain,
          transport: http(),
        })
      );

      const [
        mainnetEthBalance,
        sepoliaEthBalance,
        mainnetUsdcBalance,
        sepoliaUsdcBalance,
        mainnetUsdcDecimals,
        sepoliaUsdcDecimals,
      ] = await Promise.all([
        mainnetClient.getBalance({
          address: embeddedWallet.address as Address,
        }),
        sepoliaClient.getBalance({
          address: embeddedWallet.address as Address,
        }),
        mainnetClient.readContract({
          address: NETWORKS[0].usdcAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [embeddedWallet.address as Address],
        }),
        sepoliaClient.readContract({
          address: NETWORKS[1].usdcAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [embeddedWallet.address as Address],
        }),
        mainnetClient.readContract({
          address: NETWORKS[0].usdcAddress,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
        sepoliaClient.readContract({
          address: NETWORKS[1].usdcAddress,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
      ]);

      const newBalances: TokenBalance[] = [
        {
          symbol: "ETH",
          balance: formatEther(mainnetEthBalance),
          value: `$${(Number(formatEther(mainnetEthBalance)) * 2300).toFixed(2)}`, // Example price
          network: NETWORKS[0].name,
        },
        {
          symbol: "SepoliaETH",
          balance: formatEther(sepoliaEthBalance),
          value: `$${(Number(formatEther(sepoliaEthBalance)) * 2300).toFixed(2)}`, // Corrected to sepoliaEthBalance
          network: NETWORKS[1].name,
        },
        {
          symbol: "USDC",
          balance: formatUnits(mainnetUsdcBalance, mainnetUsdcDecimals),
          value: `$${formatUnits(mainnetUsdcBalance, mainnetUsdcDecimals)}`,
          network: NETWORKS[0].name,
        },
        {
          symbol: "SepoliaUSDC",
          balance: formatUnits(sepoliaUsdcBalance, sepoliaUsdcDecimals),
          value: `$${formatUnits(sepoliaUsdcBalance, sepoliaUsdcDecimals)}`, // Corrected to sepoliaUsdcBalance
          network: NETWORKS[1].name,
        },
      ];

      setBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
      setError("Failed to fetch balances. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [wallets]);

  useEffect(() => {
    if (wallets.length > 0 && !isRefreshing) {
      fetchBalances();
    }
  }, [wallets, fetchBalances]);

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Assets</h1>
          <Button variant="ghost" size="icon" onClick={fetchBalances} disabled={isRefreshing}>
            <RefreshCcw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Wallet Address */}
        <Card className="p-4 mb-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Connected Wallet</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono">
                {user.wallet?.address.slice(0, 6)}...
                {user.wallet?.address.slice(-4)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(
                    `${NETWORKS[0].blockExplorer}/address/${user.wallet?.address}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Balances */}
        <div className="space-y-4">
          {isRefreshing ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1] mx-auto mb-4" />
              <p>Refreshing balances...</p>
            </div>
          ) : balances.length > 0 ? (
            balances.map((token, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {token.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-sm text-gray-500">
                        {Number(token.balance).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </p>
                      <p className="text-xs text-gray-400">{token.network}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{token.value}</p>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bitcoin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No crypto assets found</p>
            </div>
          )}
        </div>
      </main>
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
