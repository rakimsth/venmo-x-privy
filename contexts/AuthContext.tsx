"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePrivy, PrivyProvider } from "@privy-io/react-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type AuthContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  user: {
    id: string;
    email?: string;
    wallet?: {
      address: string;
    };
    clientType?: string;
  } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const [isLoading, setIsLoading] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [fullName, setFullName] = useState("");
  const [, setIsCheckingUser] = useState(false);

  const updateUserInDatabase = useCallback(async (userData: any) => {
    if (userData && userData.email && userData.name && userData.wallet?.address) {
      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email.address,
            fullName: userData.name,
            privyWalletAddress: userData.wallet.address,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update user in database");
        }

        await response.json();
      } catch (error) {
        console.error("Error updating user in database:", error);
      }
    }
  }, []);

  const checkUserData = useCallback(async (userEmail: string) => {
    if (!userEmail) return null;

    setIsCheckingUser(true);
    try {
      const response = await fetch(`/api/user/check?email=${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (!data.success || !data.user || !data.user.fullName || !data.user.privyWalletAddress) {
        setShowNamePrompt(true);
        return null;
      }
      return data.user;
    } catch (error) {
      console.error("Error checking user full name:", error);
      setShowNamePrompt(true);
      return null;
    } finally {
      setIsCheckingUser(false);
    }
  }, []);

  const saveFullName = async () => {
    if (!fullName.trim() || !user?.email) return;

    try {
      await updateUserInDatabase({
        ...user,
        name: fullName,
      });
      setShowNamePrompt(false);
    } catch (error) {
      console.error("Error saving full name:", error);
    }
  };

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
      if (authenticated && user) {
        const checkAndUpdateUser = async () => {
          if (user?.email?.address) {
            const existingUser = await checkUserData(user?.email?.address);
            if (!existingUser || !existingUser.fullName || !existingUser.privyWalletAddress) {
              // Only update if we don't have all the required information
              await updateUserInDatabase(user);
            }
          }
        };
        checkAndUpdateUser();
      }
    }
  }, [ready, authenticated, user, checkUserData, updateUserInDatabase]);

  const authContextValue: AuthContextType = {
    isLoading,
    isLoggedIn: authenticated,
    login,
    logout,
    user: user
      ? {
          id: user.id,
          email: user?.email?.address,
          clientType: user?.wallet?.walletClientType,
          wallet: user.wallet ? { address: user.wallet.address } : undefined,
        }
      : null,
  };

  // Name prompt dialog
  const namePromptDialog = (
    <Dialog open={showNamePrompt} onOpenChange={setShowNamePrompt}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to PrivyPay</DialogTitle>
          <DialogDescription>Please provide your full name to continue.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full-name" className="text-right">
              Full Name
            </Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3"
              placeholder="John Doe"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={saveFullName} disabled={!fullName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {namePromptDialog}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const PrivyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#4169E1",
        },
        fundingMethodConfig: {
          moonpay: {
            paymentMethod: "credit_debit_card", // Purchase with credit or debit card
            uiConfig: { accentColor: "#696FFD", theme: "light" },
          },
        },
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </PrivyProvider>
  );
};
