"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast, Toaster } from "sonner";

type Friend = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
};

export default function FriendsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
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

  const handleSendMoney = (friend: Friend) => {
    router.push(`/transfers?recipient=${encodeURIComponent(friend.walletAddress)}`);
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="h-8 bg-white"></div>
      <main className="flex-1 px-4 pt-4 pb-20">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/search")}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Search
          </Button>
          <h1 className="text-2xl font-semibold ml-2">Friends</h1>
        </div>

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
              <p className="text-center text-gray-500">You haven&apos;t added any friends yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <BottomNavigation />
      <Toaster />
    </div>
  );
}
