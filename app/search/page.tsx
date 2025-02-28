"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Search, Send, Loader2, Users, UserPlus } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { toProperCase } from "@/utils/stringUtils";

type SearchResult = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  isFriend: boolean;
};

export default function SearchPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!user?.email) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&currentUserEmail=${encodeURIComponent(
          user.email
        )}`
      );
      const data = await response.json();
      if (data.success) {
        setSearchResults(
          data.results.map((result: SearchResult) => ({
            ...result,
            name: toProperCase(result.name),
          }))
        );
      } else {
        throw new Error(data.error || "Failed to search users");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const handleInvite = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const email = formData.get("email") as string;
        const fullName = toProperCase(formData.get("fullName") as string);

        if (!user?.email) {
          throw new Error("User email not found");
        }

        const response = await fetch("/api/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            fullName,
            inviterEmail: user.email,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to send invite");
        }

        toast.success("Invitation Sent", {
          description: `An invitation has been sent to ${email}`,
        });
        setShowInviteDialog(false);
      } catch (error) {
        console.error("Invitation failed:", error);
        toast.error("Invitation Failed", {
          description: error instanceof Error ? error.message : "An unknown error occurred",
        });
      }
    });
  };

  const handleSendMoney = (recipient: string) => {
    router.push(`/transfers?recipient=${encodeURIComponent(recipient)}`);
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
          <Button variant="ghost" onClick={() => router.push("/home")}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold ml-2">Search</h1>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 pr-10 py-6 bg-white rounded-full"
            placeholder="Search People, Business, & Charities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={handleSearch}
          >
            <Search className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        <div className="flex justify-between mt-4 mb-6">
          <Button
            className="flex-1 mr-2 bg-[#4169E1] hover:bg-[#3158D3] text-white"
            onClick={() => router.push("/friends")}
          >
            <Users className="h-4 w-4 mr-2" />
            Friends
          </Button>
          <Button
            className="flex-1 ml-2 bg-[#4169E1] hover:bg-[#3158D3] text-white"
            onClick={() => router.push("/invites")}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invites
          </Button>
        </div>

        {isSearching ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169E1]" />
          </div>
        ) : searchResults.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {searchResults.map((result) => (
                  <li key={result.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{result.name}</p>
                      <p className="text-sm text-gray-500">{result.email}</p>
                    </div>
                    {result.isFriend ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMoney(result.walletAddress)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Money
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInviteEmail(result.email);
                          setInviteFullName(result.name);
                          setShowInviteDialog(true);
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center mt-8">
            <p className="text-gray-500 mb-4">No results found</p>
            <Button
              variant="outline"
              onClick={() => {
                setInviteEmail("");
                setInviteFullName(toProperCase(query));
                setShowInviteDialog(true);
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Invite {toProperCase(query)}
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation to join PrivyPay to this user.</DialogDescription>
          </DialogHeader>
          <form action={handleInvite}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invite-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="invite-email"
                  name="email"
                  defaultValue={inviteEmail}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invite-fullName" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="invite-fullName"
                  name="fullName"
                  defaultValue={inviteFullName}
                  placeholder="John Doe"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
      <Toaster />
    </div>
  );
}
