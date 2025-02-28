"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, X } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast, Toaster } from "sonner";

type Invite = {
  id: string;
  email: string;
  fullName: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
  type: "sent" | "received";
};

export default function InvitesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [receivedInvites, setReceivedInvites] = useState<Invite[]>([]);
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvites = async () => {
      if (user?.email) {
        setIsLoadingInvites(true);
        setError(null);
        try {
          const response = await fetch(`/api/invites?email=${encodeURIComponent(user.email)}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (data.success) {
            setReceivedInvites(data.receivedInvites);
            setSentInvites(data.sentInvites);
          } else {
            throw new Error(data.error || "Failed to fetch invites");
          }
        } catch (error) {
          console.error("Error fetching invites:", error);
          setError("Failed to load invites. Please try again later.");
          toast.error("Failed to load invites", {
            description: error instanceof Error ? error.message : "An unknown error occurred",
          });
        } finally {
          setIsLoadingInvites(false);
        }
      }
    };

    if (user) {
      fetchInvites();
    }
  }, [user]);

  const handleAcceptInvite = async (id: string) => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    try {
      const response = await fetch("/api/invites/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteId: id, userEmail: user.email }),
      });
      const data = await response.json();
      if (data.success) {
        setReceivedInvites((prevInvites) =>
          prevInvites.map((invite) =>
            invite.id === id ? { ...invite, status: "accepted" } : invite
          )
        );
        toast.success("Invite accepted");
      } else {
        throw new Error(data.error || "Failed to accept invite");
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast.error("Failed to accept invite", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleDeclineInvite = async (id: string) => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    try {
      const response = await fetch("/api/invites/decline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteId: id, userEmail: user.email }),
      });
      const data = await response.json();
      if (data.success) {
        setReceivedInvites((prevInvites) =>
          prevInvites.map((invite) =>
            invite.id === id ? { ...invite, status: "declined" } : invite
          )
        );
        toast.success("Invite declined");
      } else {
        throw new Error(data.error || "Failed to decline invite");
      }
    } catch (error) {
      console.error("Error declining invite:", error);
      toast.error("Failed to decline invite", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

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

  const renderInviteList = (invites: Invite[], type: "sent" | "received") => (
    <ul className="space-y-4">
      {invites.map((invite) => (
        <li key={invite.id} className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{invite.fullName}</p>
            <p className="text-sm text-gray-500">{invite.email}</p>
            <p className="text-xs text-gray-400">
              {type === "received" ? "Received on: " : "Sent on: "}
              {new Date(invite.invitedAt).toLocaleDateString()}
            </p>
          </div>
          {type === "received" && invite.status === "pending" && (
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleAcceptInvite(invite.id)}>
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDeclineInvite(invite.id)}>
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          )}
          {invite.status !== "pending" && (
            <span className="text-sm text-gray-500 capitalize">{invite.status}</span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="h-8 bg-white"></div>
      <main className="flex-1 px-4 pt-4 pb-20">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/search")}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Search
          </Button>
          <h1 className="text-2xl font-semibold ml-2">Invites</h1>
        </div>

        {error ? (
          <div className="text-center text-red-500 my-4">{error}</div>
        ) : (
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received">Received Invites</TabsTrigger>
              <TabsTrigger value="sent">Sent Invites</TabsTrigger>
            </TabsList>
            <TabsContent value="received">
              <Card>
                <CardContent className="pt-6">
                  {isLoadingInvites ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
                    </div>
                  ) : receivedInvites.length > 0 ? (
                    renderInviteList(receivedInvites, "received")
                  ) : (
                    <p className="text-center text-gray-500">No received invites found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sent">
              <Card>
                <CardContent className="pt-6">
                  {isLoadingInvites ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
                    </div>
                  ) : sentInvites.length > 0 ? (
                    renderInviteList(sentInvites, "sent")
                  ) : (
                    <p className="text-center text-gray-500">No sent invites found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
      <BottomNavigation />
      <Toaster />
    </div>
  );
}
