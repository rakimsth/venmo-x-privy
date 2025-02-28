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
import { Mail, ArrowLeft, Search, Send, Loader2 } from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "../../contexts/AuthContext";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { sendInvitation } from "../actions/sendInvitation";

type SearchResult = {
  name: string;
  email: string;
  isRegistered: boolean;
};

export default function SearchPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = (searchQuery: string) => {
    // This is a mock search function. In a real application, you would call an API here.
    const mockResults: SearchResult[] = [
      { name: "John Doe", email: "john@example.com", isRegistered: true },
      { name: "Jane Smith", email: "jane@example.com", isRegistered: true },
      { name: "Alice Johnson", email: "alice@example.com", isRegistered: false },
    ].filter(
      (result) =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(mockResults);
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const handleInvite = async (formData: FormData) => {
    setIsInviting(true);
    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;

    try {
      // First, send the invitation email
      const emailResult = await sendInvitation(formData);

      if ("error" in emailResult) {
        throw new Error(emailResult.error);
      }

      // If email sent successfully, store the invite in MongoDB
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, fullName }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to store invite");
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
    } finally {
      setIsInviting(false);
    }
  };

  const handleSendMoney = (recipient: string) => {
    // This is where you would typically navigate to a send money page or open a modal
    console.log(`Sending money to: ${recipient}`);
    toast.success("Redirecting", {
      description: `You're being redirected to send money to ${recipient}`,
    });
    // For now, we'll just show a toast. In a real app, you might navigate to a new page:
    // router.push(`/send-money?recipient=${encodeURIComponent(recipient)}`)
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
      {/* Status Bar */}
      <div className="h-8 bg-white"></div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4 pb-20">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/home")}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold ml-2">Search Results</h1>
        </div>

        <div className="relative mb-6">
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

        {searchResults.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {searchResults.map((result, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{result.name}</p>
                      <p className="text-sm text-gray-500">{result.email}</p>
                    </div>
                    {result.isRegistered ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMoney(result.name)}
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
                setInviteEmail(query);
                setShowInviteDialog(true);
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Invite {query}
            </Button>
          </div>
        )}
      </main>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation to join SwiftPay to this user.</DialogDescription>
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
                  placeholder="John Doe"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? (
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

      {/* Bottom Navigation */}
      <BottomNavigation />
      <Toaster />
    </div>
  );
}
