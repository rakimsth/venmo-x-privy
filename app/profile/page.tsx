"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Copy, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/BottomNavigation";
import { toast, Toaster } from "sonner";

type Friend = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
};

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`/api/friends?email=${encodeURIComponent(user.email)}`);
          const data = await response.json();
          if (data.success) {
            setFriends(data.friends);
          } else {
            throw new Error(data.error || "Failed to fetch friends");
          }
        } catch (error) {
          console.error("Error fetching friends:", error);
          toast.error("Failed to load friends", {
            description: error instanceof Error ? error.message : "An unknown error occurred",
          });
        } finally {
          setIsLoadingFriends(false);
        }
      }
    };

    if (user) {
      fetchFriends();
    }
  }, [user]);

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

  const handleSendMoney = (friend: Friend) => {
    router.push(`/transfers?recipient=${encodeURIComponent(friend.walletAddress)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Status Bar */}
      <div className="h-8 bg-white"></div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-8 pb-20">
        <h1 className="text-2xl font-semibold mb-6 text-center">Profile</h1>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          <TabsContent value="wallet">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Wallet Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
                  <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <p className="text-sm font-mono">
                      {user.wallet?.address.slice(0, 6)}...{user.wallet?.address.slice(-4)}
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
                  <p className="font-semibold">{user.wallet?.walletClientType || "Unknown"}</p>
                </div>
              </div>
            </Card>

            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDisconnect}
            >
              <LogOut className="mr-2 h-4 w-4" /> Disconnect Wallet
            </Button>
          </TabsContent>
          <TabsContent value="friends">
            <Card>
              <CardContent className="pt-6">
                {isLoadingFriends ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
                  </div>
                ) : friends.length > 0 ? (
                  <ul className="space-y-4">
                    {friends.map((friend) => (
                      <li key={friend.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{friend.name}</p>
                          <p className="text-sm text-gray-500">{friend.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleSendMoney(friend)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Money
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500">
                    You haven&apos;t added any friends yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
      <Toaster />
    </div>
  );
}
